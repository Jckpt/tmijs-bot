const tmi = require('tmi.js');
const mysql = require('mysql');
const cleverbot = require('cleverbot-free');
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
var messages = [];
const stinkers = ['overpow', 'randombrucetv'];
const beOnChat = ['xayoo_', 'lukisteve', 'krawcu_'];
var stallTheCommand = false;
const onSub = (channel, username, gifter) => {
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
  if (stinkers.includes(channel)) {
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
  let delay = 1500;
  if (self) return;
  if (stinkers.includes(channel)) return;
  if (
    message.toLowerCase() === `@${process.env.BOT_USERNAME} pogchamp` ||
    message.toLowerCase() === `@${process.env.BOT_USERNAME}, pogchamp` ||
    message.toLowerCase() === `${process.env.BOT_USERNAME}, pogchamp` ||
    message.toLowerCase() === `${process.env.BOT_USERNAME} pogchamp`
  ) {
    client.say(channel, `@${tags.username} PogChamp`);
  }
  if (
    message.toLowerCase() === `@${process.env.BOT_USERNAME} vislaud` ||
    message.toLowerCase() === `@${process.env.BOT_USERNAME}, vislaud` ||
    message.toLowerCase() === `${process.env.BOT_USERNAME}, vislaud` ||
    message.toLowerCase() === `${process.env.BOT_USERNAME} vislaud`
  ) {
    client.say(channel, `@${tags.username} PogChamp`);
  }
  if (channel === 'lukisteve' && message.startsWith('$m')) {
    if (stallTheCommand === true) return;
    message = message.substring(3);
    cleverbot(message, messages).then((response) => {
      messages = [...messages, message];
      if (messages.length >= 11) {
        messages.shift();
      }
      client.say(channel, `@${tags.username} ${response}`);
    });
  }
  stallTheCommand = true;
  setTimeout(() => {
    stallTheCommand = false;
  }, delay);
});
