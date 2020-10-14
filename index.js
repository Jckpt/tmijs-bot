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
const stinkChat = ['overpow', 'randombrucetv'];
const doChat = ['lukisteve', 'krawcu_', 'xayoo_', 'japczan', 'popo', 'aki_997', 'vysotzky'];
const lurkChat = [ 'nieuczesana', 'nervarien', 'arquel', 'paramaxil'];
const dontSaveIntoDbChat = ['panna_alexandra01', 'koposova', 'maailinh', 'zony', 'keanelol'];
var everyChannel = [...stinkChat, ...doChat, ...lurkChat, ...dontSaveIntoDbChat];
var stallTheCommand = false;
const onSub = (channel, username, gifter, gifted) => {
  channel = channel.substring(1);
  let query = `SELECT nick, subscribed_to FROM users WHERE nick="${username}" AND subscribed_to="${channel}";`;
  db.query(query, (err, result) => {
    console.log(`checking if ${username} is already in database`);
    if (err) throw err;
    if (result.length > 0) {
      let query = `UPDATE users SET last_updated=now(), gifted_by="${gifter}", is_expired="F" WHERE nick="${username}" AND subscribed_to="${channel}";`;
      db.query(query, (err, result) => {
        if (err) throw err;
        console.log(result);
      });
    } else {
      if(dontSaveIntoDbChat.includes(`#${channel}`) || dontSaveIntoDbChat.includes(channel)) return;
      let query = 'INSERT INTO users SET ?, last_updated=now(), is_expired="F"';
      let user = { nick: username, subscribed_to: channel, gifted_by: gifter };
      db.query(query, user, (err, result) => {
        if (err) throw err;
        console.log(result);
      });
    }
  });

  if (stinkChat.includes(channel)) {
    doChat.forEach((chat) => {
      if (gifted) {
        let reason = `Sub gift u ${channel} dla ${username} 🧀`;
        client.ban(chat, gifter, reason).catch((err) => {
          console.log(err);
        });
      } else {
        let reason = `Sub u ${channel} 🧀`;
        client.ban(chat, username, reason).catch((err) => {
          console.log(err);
        });
      }
    });
  }
};
const client = new tmi.Client({
  options: { debug: false },
  connection: {
    reconnect: true,
    secure: true,
  },
  identity: {
    username: process.env.BOT_USERNAME,
    password: `oauth:${process.env.OAUTH_TOKEN}`,
  },
  channels: everyChannel,
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
  if (self || doChat.includes(channel) || !message.startsWith('$')) return;
  let delay = 5000;
  const args = message.slice(1).split(' ');
  const command = args.shift().toLowerCase();
  let username = args[0].toLowerCase();
  let targetChannel = args[1];
  if (command === 'sub' && !stallTheCommand && args.length == 2) {
    if (everyChannel.includes(`#${targetChannel}`)) {
      let query = `SELECT nick, subscribed_to, is_expired FROM users WHERE nick="${username}" AND subscribed_to="${targetChannel}" AND is_expired="F";`;
      db.query(query, (err, result) => {
        console.log(`checking if ${username} is already in database`);
        if (err) throw err;
        if (result.length > 0) {
          console.log(result);
          client.say(channel, `@${tags.username}, ten użytkownik ma suba na tam tym kanale. ✔️`);
        } else {
          client.say(channel, `@${tags.username}, ten użytkownik nie ma suba na tam tym kanale. ❌`);
        }
      });
    } else {
      client.say(channel, `@${tags.username}, nie mam zapisanych subskrybentów tego kanału.`);
    }
    stallTheCommand = true;
    setTimeout(() => {
      stallTheCommand = false;
    }, delay);
  }
});
client.on("join", (channel, username, self) => {
  if(username.toLowerCase()==='xayoo_')
  client.say("Lukisteve", `${username} właśnie dołączył do czatu na kanale ${channel.substring(1)} O_o`);
});