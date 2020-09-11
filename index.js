const tmi = require('tmi.js');
const mysql = require('mysql');
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
// let query = 'CREATE TABLE users(id int AUTO_INCREMENT, nick varchar(30), subscribed_to varchar(30), created_on DATE, last_updated DATE, PRIMARY KEY (id));';
// db.query(query, (err, result) => {
//   if (err) throw err;
//   console.log(result);
//   console.log('created table');
// });

const stinkers = ['overpow', 'randombrucetv'];
const beOnChat = ['lukisteve', 'xayoo_', 'japczan', 'aki_997', 'popo'];

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
client.on('subscription', async (channel, username, method, message, userstate) => {
  channel = channel.substring(1);
  let query = `SELECT nick, subscribed_to FROM users WHERE nick="${username}" AND subscribed_to="${channel}";`;
  db.query(query, (err, result) => {
    console.log(`checking if ${username} is already in database`);
    if (err) throw err;
    if (result.length > 0) {
      let query = `UPDATE users SET last_updated=now() WHERE nick="${username}" AND subscribed_to="${channel}";`;
      db.query(query, (err, result) => {
        if (err) throw err;
        console.log(result);
        console.log(`updated ${username} date`);
      });
    } else {
      let query = 'INSERT INTO users SET ?, created_on=now(), last_updated=now()';
      let user = { nick: username, subscribed_to: channel };
      db.query(query, user, (err, result) => {
        if (err) throw err;
        console.log(result);
        console.log(`inserted ${username}`);
      });
    }
  });
  const reason = `Sub u ${channel} 🧀`;
  beOnChat.forEach((chat) => {
    client.ban(chat, username, reason).catch((err) => {
      client.say(chat, `${username} zasubskrybował kanał ${channel} DansGame`).catch((err) => {
        console.log(err);
      });
      console.log(err);
    });
  });
});
