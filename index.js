const tmi = require('tmi.js');
const mysql = require('mysql');
//const cleverbot = require('cleverbot-free');
require('dotenv').config();
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'nodemysql',
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
// var messages = [];
const stinkers = ['overpow', 'randombrucetv'];
const beOnChat = ['lukisteve', 'krawcu_'];
var stallTheCommand = false;
const onSub = (channel, username, gifter, gifted) => {
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

  if (stinkers.includes(channel)) {
    beOnChat.forEach((chat) => {
      if (gifted) {
        let reason = `Sub gift u ${channel} 🧀`;
        client.ban(chat, gifter, reason).catch((err) => {
          client.say(chat, `${username} dostał subgift od ${gifter} na kanale ${channel} StinkyCheese`).catch((err) => {
            console.log(err);
          });
          console.log(err);
        });
      } else {
        client.ban(chat, username, reason).catch((err) => {
          client.say(chat, `${username} zasubskrybował kanał ${channel} StinkyCheese`).catch((err) => {
            console.log(err);
          });
          console.log(err);
        });
      }
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
  onSub(channel, username, null, false);
});
client.on('resub', (channel, username) => {
  onSub(channel, username, null, false);
});
client.on('subgift', (channel, username, streakMonths, recipient, methods, userstate) => {
  onSub(channel, recipient, username, true);
});
client.on('message', (channel, tags, message, self) => {
  channel = channel.substring(1);
  let delay = 5000;
  if (self) return;
  if (stinkers.includes(channel)) return;
  if (
    message.toLowerCase() === `@${process.env.BOT_USERNAME} pogchamp` ||
    message.toLowerCase() === `@${process.env.BOT_USERNAME}, pogchamp` ||
    message.toLowerCase() === `${process.env.BOT_USERNAME}, pogchamp` ||
    message.toLowerCase() === `${process.env.BOT_USERNAME} pogchamp`
  ) {
    if (stallTheCommand === true) return;
    client.say(channel, `@${tags.username} PogChamp`);
    stallTheCommand = true;
    setTimeout(() => {
      stallTheCommand = false;
    }, delay);
  }
  //   if (
  //     message.toLowerCase() === `@${process.env.BOT_USERNAME} vislaud` ||
  //     message.toLowerCase() === `@${process.env.BOT_USERNAME}, vislaud` ||
  //     message.toLowerCase() === `${process.env.BOT_USERNAME}, vislaud` ||
  //     message.toLowerCase() === `${process.env.BOT_USERNAME} vislaud`
  //   ) {
  //     if (stallTheCommand === true) return;
  //     client.say(channel, `@${tags.username} VisLaud`);
  //     stallTheCommand = true;
  //     setTimeout(() => {
  //       stallTheCommand = false;
  //     }, delay);
  //   }
  //   if (channel === 'lukisteve' && message.startsWith('$m')) {
  //     if (stallTheCommand === true) return;
  //     message = message.substring(3);
  //     cleverbot(message, messages).then((response) => {
  //       messages = [...messages, message];
  //       if (messages.length >= 11) {
  //         messages.shift();
  //       }
  //       client.say(channel, `@${tags.username} ${response}`);
  //     });
  //   }
  //   stallTheCommand = true;
  //   setTimeout(() => {
  //     stallTheCommand = false;
  //   }, delay);
});
