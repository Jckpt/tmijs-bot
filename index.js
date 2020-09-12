const tmi = require('tmi.js');
const mysql = require('mysql');
require('dotenv').config();
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'twitchbot',
});
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Mysql connected...');
});
// let query = 'CREATE TABLE users(id int AUTO_INCREMENT, nick varchar(30), subscribed_to varchar(30), gifted_by varchar(30), created_on DATE, last_updated DATE, PRIMARY KEY (id));';
// db.query(query, (err, result) => {
//   if (err) throw err;
//   console.log(result);
//   console.log('created table');
// });

const stinkers = ['overpow', 'randombrucetv'];
const beOnChat = ['lukisteve', 'xayoo_'];
const onSub = (channel, username, gifter) => {
  if (stinkers.includes(channel)) {
    channel = channel.substring(1);
    let query = `SELECT nick, subscribed_to FROM users WHERE nick="${username}" AND subscribed_to="${channel}";`;
    db.query(query, (err, result) => {
      console.log(`checking if ${username} is already in database`);
      if (err) throw err;
      if (result.length > 0) {
        let query = `UPDATE users SET last_updated=now(), gifted_by="${gifter}" WHERE nick="${username}" AND subscribed_to="${channel}";`;
        db.query(query, (err, result) => {
          if (err) throw err;
          console.log(result);
        });
      } else {
        let query = 'INSERT INTO users SET ?, created_on=now(), last_updated=now()';
        let user = { nick: username, subscribed_to: channel, gifted_by: gifter };
        db.query(query, user, (err, result) => {
          if (err) throw err;
          console.log(result);
        });
      }
    });
    let reason = `Sub u ${channel} 🧀`;
    beOnChat.forEach((chat) => {
      client.ban(chat, username, reason).catch((err) => {
        client
          .say(chat, gifter === null ? `${username} dostał subgift od ${gifter} na kanale ${channel} StinkyCheese` : `${username} zasubskrybował kanał ${channel} StinkyCheese`)
          .catch((err) => {
            console.log(err);
          });
        console.log(err);
      });
    });
  }
};
const client = new tmi.Client({
  options: { debug: true },
  connection: {
    reconnect: true,
    secure: true,
  },
  identity: {
    username: process.env.BOT_USERNAME,
    password: `oauth:${process.env.OAUTH_TOKEN}`,
  },
  channels: [...stinkers, ...beOnChat],
});
client.connect();
client.on('subscription', (channel, username) => {
  onSub(channel, username, null);
});
client.on('resub', (channel, username) => {
  onSub(channel, username, null);
});
client.on('subgift', (channel, username, streakMonths, recipient, methods, userstate) => {
  onSub(channel, recipient, username);
});
client.on('message', (channel, tags, message, self) => {
  channel = channel.substring(1);
  if (self) return;
  if (stinkers.includes(channel)) return;
  if (
    message.toLowerCase() === '@krawcu_bot pogchamp' ||
    message.toLowerCase() === '@krawcu_bot, pogchamp' ||
    message.toLowerCase() === 'krawcu_bot, pogchamp' ||
    message.toLowerCase() === 'krawcu_bot pogchamp'
  ) {
    client.say(channel, `@${tags.username} PogChamp`);
  }

  if (message.toLowerCase() === '!discord' && channel === 'xayoo_') {
    client.say(channel, `@${tags.username} discord jest dostępny od trzeciego miesiąca subskrypcji!`);
  }
});
