var express = require('express');
var didyoumean = require('didyoumean');
var request = require('request');
const is  = require('is-html');
const url  = require('is-url');
const showdown  = require('showdown');
const converter = new showdown.Converter();

var Manager = require('./manage.js');
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

function create(len) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < len; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

var app = express();
app.use(express.static('public'));
var bodyParser = require('body-parser');
app.set('view engine', 'ejs');
app.use(bodyParser.json());

var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

app.get('/', function(request, response) {
  if (!request.query.q) response.sendFile(__dirname + '/views/index.html');
  else response.redirect(`/search?q=${encodeURIComponent(request.query.q)}`)
});

app.get("/api/search", function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  Manager.search(req.query.q).then(res2 => {
    res.json(res2)
  })
});

app.get('/remove', function(req, res) {
  Manager.remove(JSON.parse(req.query.bot)).then(ans => {res.send(ans)})
});

app.get('/list', function (req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type'); // If needed
  res.setHeader('Access-Control-Allow-Credentials', true); // If needed
  Manager.fetchAll().then(ans => {
    ans.forEach(b => {delete b.auth})
    res.send(ans)
  })
})

app.get('/search', function (req, res) {
  let search = decodeURIComponent(req.query.search)
  let names = []
  request({url: "https://dbots-listing.glitch.me/list", json: true}, function (one, two, result) {
    result.forEach(function(bot) {
      names.push(bot.name)
    })
    let ans = didyoumean(search, names)
    if (ans == null) return res.send({error: "No bots found for this search"})
    let i = names.indexOf(ans)
    res.send({"search":search, "result": result[i]})
  })
});


app.get('/bots/:id', async function (req, res) {
  Manager.fetch(req.params.id).then( async function(response) {
  let person = await CLIENT.guilds.first().fetchMember(CLIENT.users.find(u => u.id===response.bot.owner));
  let b = "#8c8c8c";
  try {
    let c = await CLIENT.users.find(u => u.id===response.bot.id).presence.status
    switch(c) {
      case "online":
        b = "#32ff00"
        break;
      case "offline":
        b = "#8c8c8c"
        break;
      case "idle":
        b = "#ffaa00";
        break;
      case "dnd":
        b = "#ff0000";
        break;
    }
    
  } catch(e) {
    console.log(e)
    b = "#8c8c8c"
  };
    
    
    var desc = ``;
    let isUrl = url(response.bot.long.replace("\n", "").replace(" ", ""))
    if (isUrl) desc = `
<object data="${response.bot.long.replace("\n", "").replace(" ", "")}" width="600" height="400" style="width: 100%; height: 100vh;">
    <embed src="${response.bot.long.replace("\n", "").replace(" ", "")}" width="600" height="400" style="width: 100%; height: 100vh;"> </embed>
    response.bot.long.replace("\n", "").replace(" ", "") 
</object>`
    else if (response.bot.long) desc = converter.makeHtml(response.bot.long);
    else desc = response.bot.description;
    res.send(`
<!DOCTYPE html>
<html>
  <head>
    <meta property="og:title" content="Discord Bots"/>
    <meta property="og:type" content="website"/>
    <meta property="og:description" content="Just another bot list for discord..."/>
    <meta name="description" content="Just another bot list for discord..."/>
    <meta name="og:image" content="https://cdn.glitch.com/923d0d4c-ddf5-4822-8cd7-b12b2c8bb20c%2Frandombot.png?1535715799649"/>
    <meta name="theme-color" content="#d2efe6" />
    <link href="/main.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/icon?family=Markazi+Text" rel="stylesheet">
    <meta content="width=device-width, initial-scale=1.0" name="viewport"> 
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.0.13/css/all.css">
    <link rel="stylesheet" href="/md.css">
    <script src="https://ajax.aspnetcdn.com/ajax/jQuery/jquery-3.3.1.min.js"></script>

    <script src="/bot/script.js"></script>
    
    <link rel="shortcut icon" type="image/png" href="https://cdn.glitch.com/923d0d4c-ddf5-4822-8cd7-b12b2c8bb20c%2Frandombot.png?1535715799649"/>
    <title>Discord Bots</title>
  </head>
  <body>
    <div id="top">
      <span id="nav">
        <a id="logout" href="#">Logout</a>
      </span>
      <img id="bot-icon" width="130px" height="130px" style="border-color: ${b}" src="${response.bot.logo}">
      <h1>${response.bot.name}</h1>
    </div>
    <div id="content">
      <br /><br /><br /><br />
      <table class="tg">
        <tr>
          <th class="tg-0lax">Prefix</th>
          <th class="tg-0lax">${response.bot.prefix}</th>
        </tr>
        <tr>
          <td class="tg-0lax">Servers</td>
          <td class="tg-0lax">${response.bot.servers ? response.bot.servers : "Unknown"}</td>
        </tr>
        <tr>
          <td class="tg-0lax">Owner</td>
          <td class="tg-0lax">${person.user.username}#${person.user.discriminator}</td>
        </tr>
      </table>
      <div id="long">
        <span class="${isUrl ? "" : "markdown-body"}"> ${desc} </span>
      </div>
      <div id="inv"> <a target="_blank" href="${response.bot.invite ? response.bot.invite : `https://discordapp.com/oauth2/authorize?client_id=${response.bot.id}&scope=bot&permissions=0`}">Invite Link</a> </div>
      
      <div id="by">Made by ${`${person.user.username}#${person.user.discriminator}`}</div>
    </div>
    <div id="botOwnerGetter" style="display: none">${response.bot.owner}</div>
    <i class="fas fa-lightbulb light" id="switch" onclick="switched(this)"></i>
  </body>
</html>
`)
  });
});

app.get('/edit/:id', async function (req, res) {
  Manager.fetch(req.params.id).then( async function(response) {
    let bot = response.bot;
    if (bot.owner === "") bot.presentable === true;
    res.render("edit/index", {bot: bot})
  });
});


app.get("/new/",  function (req, res) {
  let data = JSON.parse(req.query.data);
  let url = `https://dbots-listing.glitch.me/api/get?token=${encodeURIComponent(data.token)}`
  let url2 = `https://dbots-listing.glitch.me/api/get/bot/?token=${data.token}&id=${encodeURIComponent(data.id)}`

  if (data.short.length >= 100) return res.redirect("/error?e=long")
  request({url: url, json: true}, function (err1, res1, body) {
    if (body[0].message === "401: Unauthorized") return res.redirect("/error?e=user")
    request({url: url2, json: true}, function (err2, res2, body2) {
      request({url:`https://dbots-listing.glitch.me/api/members?token=${data.token}`, json: true}, function (err3, res3, body3) {
        if (body3 === "false") return res.redirect("/error?e=server")
      body2 = body2[0]
      if (body2.user_id  && body2.user_id[0].endsWith("is not snowflake.")) return res.redirect("/error?e=unknown")
      if (body2.message == "Unknown User") return res.redirect("/error?e=unknown")
      if (body2.bot !== true) return res.redirect("/error?e=human")
      let bot2 = {
        name: body2.username,
        id: body2.id,
        logo: `https://cdn.discordapp.com/avatars/${body2.id}/${body2.avatar}.png`,
        invite: data.link,
        description: data.short,
        long: data.long,
        prefix: data.prefix,
        state: "unverified",
        owner: body[0].id
      };
      
      
      if (is(bot2.long)) return res.redirect("/error?e=html");
      let rt = /(?:https|http)\:\/\/discordapp\.com\/oauth2\/authorize\?(?:scope=bot\&client_id=[0-9]+\&permissions=(-)?[0-9]+|scope=bot\&permissions=(-)?[0-9]+client_id=[0-9]+|client_id=[0-9]+\&scope=bot&permissions=(-)?[0-9]+|client_id=[0-9]+\&permissions=[0-9]+&scope=bot|permissions=(-)?[0-9]+\&client_id=[0-9]+\&scope=bot|permissions=(-)?[0-9]+\&scope=bot&client_id=[0-9]+)/gm
      let a = data.link.match(rt);
      if (!a && data.link !== "") return res.redirect(`/error?e=invite`);
      
      Manager.fetch(bot2.id).then(ans => {
        if (ans == false)  Manager.add(bot2).then(function(){
          let r = CLIENT.guilds.first().roles.find(r => r.id ==="481492246319857675");
          r.setMentionable(true).then(() => {
            CLIENT.guilds.first().channels.find(c => c.id === "481845491940982785").send(`<@${bot2.owner}> added <@${bot2.id}>: ${r}`)
              .then(() => {r.setMentionable(false)})
            res.redirect("/success")
          }).catch(console.log)
        })
        else res.redirect(`/error?e=${ans.bot.state}`)
      })
      })
    })
  })
})



app.get("/modify/",  function (req, res) {
  let data = JSON.parse(req.query.data);
  let url = `https://dbots-listing.glitch.me/api/get?token=${encodeURIComponent(data.token)}`;
  request({url: url, json: true}, function (err1, res1, body) {
    Manager.fetch(data.id).then(ans => {
      let bot = ans.bot;
      let user = body[0];
      
      let rt = /(?:https|http)\:\/\/discordapp\.com\/oauth2\/authorize\?(?:scope=bot\&client_id=[0-9]+\&permissions=[0-9]+|scope=bot\&permissions=[0-9]+client_id=[0-9]+|client_id=[0-9]+\&scope=bot&permissions=[0-9]+|client_id=[0-9]+\&permissions=[0-9]+&scope=bot|permissions=[0-9]+\&client_id=[0-9]+\&scope=bot|permissions=[0-9]+\&scope=bot&client_id=[0-9]+)/gm
      let a = data.link.match(rt);
      
      if (body[0].message === "401: Unauthorized") return res.redirect("/error?e=user")
      if (bot.owner !== user.id && user.id !== "297403616468140032") return res.redirect(`/error?e=owner`);
      if (bot.id !== data.id) return res.redirect(`/error?e=id`);
      if (data.short.length >= 100) return res.redirect(`/error?e=long`)
      if (!a && data.link !== "") return res.redirect(`/error?e=invite`);
      if (is(data.long)) return res.redirect(`/error?e=html`);
      
      bot.invite = data.link;
      bot.description = data.short;
      bot.long = data.long;
      bot.prefix = data.prefix; 
      
      Manager.update(bot.id, bot);
      
      CLIENT.guilds.first().channels.find(c => c.id === "481845491940982785").send(`<@${user.id}> has updated <@${bot.id}>`)
      res.redirect(`/bots/${bot.id}`);
    });
  });
});

app.get("/api/auth/:id", (req, res) => {
  let token = req.query.token;
  let botId = req.params.id;
  if (!token) return res.json({"success":"false", "error": "Invalid token"})
  let url = `https://dbots-listing.glitch.me/api/get?token=${encodeURIComponent(token)}`;
  request({url: url, json: true}, function (err1, res1, body) {
    Manager.fetch(botId).then(ans => {
      console.log(body)
      let bot = ans.bot;
      let user = body[0];
      if (bot.owner !== user.id) return res.json({"success":"false", "error": "Bot owner is not user."});
      bot.auth = create(20);
      Manager.update(botId, bot);
      res.json({"success": "true", "Authorization Token": bot.auth})
    });
  });
});

app.post('/api/stats/:id', (req, res) => {
  let botId = req.params.id;
  
  let auth = req.headers.authorization;
  if (!auth) return res.json({"success": "false", "error": "Authorization header not found."});
  console.log(req.body);
  let count = req.body.count ? req.body.count : req.body.server_count;
  
  if (!count) return res.json({"success": "false", "error": "Count not found in body."});
  count = parseInt(count);
  if (!count) return res.json({"success": "false", "error": "Count not integer."});
  Manager.fetch(botId).then(ans => {
    let bot = ans.bot;
    if (!bot) return res.json({"success": "false", "error": "Bot not found."})
    if (!bot.auth) return res.json({"success": "false", "error": "Create a bot authorization token."});
    if (bot.auth !== auth) return res.json({"success": "false", "error": "Incorrect authorization token."});
    bot.servers = count;
    Manager.update(botId, bot);
    delete bot.auth;
    res.json({"success": "true", "bot": bot})
  });
});

// Discord Stuff
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const redirect = encodeURIComponent("https://dbots-listing.glitch.me" + '/api/discord/callback');
const catchAsync = fn => ((req, res, next) => {
    const routePromise = fn(req, res, next);
    if (routePromise.catch) {routePromise.catch(err => next(err));}
});
const unirest = require('unirest');
const btoa = require('btoa');
const fetch = require('node-fetch');


app.get('/api/discord/login', (req, res) => {
  res.redirect(`https://discordapp.com/api/oauth2/authorize?client_id=477793621509144576&response_type=code&scope=email%20identify`);
});

app.get('/api/discord/callback', catchAsync(async (req, res) => {
  if (!req.query.code) throw new Error('NoCodeProvided');
  const code = req.query.code;
  const creds = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
  const response = await fetch(`https://discordapp.com/api/oauth2/token?grant_type=authorization_code&code=${code}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${creds}`,
      },
    });
  const json = await response.json();
  res.redirect(`/api/store?token="${json.access_token}"`);
}));

app.get('/api/store', (req, res) => {
  res.send(`
  <script>
  localStorage.setItem("token", ${req.query.token});
  window.location.href="/"
  </script>
`)
})

app.get('/api/get', (req, res) => {
  let data = []
  unirest.get("https://discordapp.com/api/users/@me").headers({'Authorization': `Bearer ${req.query.token}`}).end(function(user) {
    if (user["raw_body"].error) return res.redirect('/api/discord/login')
    data.push(JSON.parse(user["raw_body"]));
    res.send(data)
  });
});

app.get('/api/get/bot/', (req, res) => {
  let data = []
  unirest.get(`https://discordapp.com/api/users/${req.query.id}`).headers({'Authorization': `Bot ${process.env.token}`}).end(function(user) {
    if (user["raw_body"].error) return res.redirect('/api/discord/login')
    data.push(JSON.parse(user["raw_body"]));
    res.send(data);
  });
});


app.get('/api/bot', (req, res) => {
  res.send({"success": "false", "error": "Bot id not provided"})
});
app.get('/api/bot/:id', (req, res) => {
  Manager.fetch(req.params.id).then(ans => {
    if (ans === false) return res.send({"success": "false", "error": "Bot not found"})
    delete ans.bot.auth;
    ans.bot.success = "true";
    res.send(ans.bot);
  });
});

app.get('/api/members', (req, res) => {
  if (!req.query.token) return res.send(false)
  unirest.get("https://discordapp.com/api/users/@me").headers({'Authorization': `Bearer ${req.query.token}`}).end(function(user) {
    if (user["raw_body"].error) return res.send(false);
    let find = JSON.parse(user["raw_body"]).id;
    CLIENT.guilds.first().fetchMembers().then(ans => {
      ans = ans.members
      let person = ans.find(p => p.id === find);
      if (person) res.send(true);
      else res.send(false)
    });
  });
});


/* web stuff above this */
const Discord = require('discord.js');
const CLIENT = new Discord.Client();
var fs = require('fs');
const admins = ["297403616468140032"]
const reasons = {
  "1": `Your bot was offline when we tried to verify it.`,
  "2": `Your bot is a clone of another bot`,
  "3": `Your bot responds to other bots`,
  "4": `Your bot doesn't have any/enough working commands. (Minimum: 7)`,
  "5": `Your bot has NSFW commands that work in non-NSFW marked channels`,
  "6": `Your bot doesn't have a working help command or commands list`
}

CLIENT.on('ready', () => {
  CLIENT.user.setPresence({ game: { name: 'other discord Bots', type: 'WATCHING'}});
  console.log('--------------------------------------');
  console.log('Name    : ' + CLIENT.user.username + '#' + CLIENT.user.discriminator);
  console.log('ID      : ' + CLIENT.user.id);
  console.log('Servers : ' + CLIENT.guilds.size);
  console.log('-------------------------------------');
});

CLIENT.on('message', message => {
  if (message.author.bot) return;
  if (!message.guild) return;
  let prefix = "-"
  let msg = message.content.toLowerCase(); 
  let sender = message.author;
  let channel = message.channel
  
  if (message.member.hasPermission("ADMINISTRATOR") && !admins.includes(message.author.id)) admins.push(message.author.id)

  let cmd;
  if (message.isMentioned(message.guild.me)) cmd = msg.replace(`<@${CLIENT.id}> `, "").replace(`<@${CLIENT.id}>`, "").split(' ')[0]
  else cmd = msg.slice(prefix.length).split(" ")[0]
  
  let args = msg.replace(cmd + " ", cmd).split(cmd)[1]
  if (args !== undefined) args = args.split(" ");
  else args = [];
  
  let modLog = message.guild.channels.find(c => c.id === "481845465298501632");
  const filter = m => m.author.id === sender.id;
  if (!msg.startsWith(prefix)) return
  switch(cmd) {
    case "ping":
      channel.send('Pong');
      break;
    case "bots":
      Manager.mine(sender.id).then(bts => {
        if (bts.length === 0) return channel.send('You have no bots. Add one at [INSERT LINK HERE].')
        var cont = ``
        var un = false;
        for (let i = 0; i < bts.length; i++) {
          let bot = bts[i];
          if (bot.state == "unverified") {
            un = true
            cont += `~~<@${bot.id}>~~\n`
          }
          else cont += `<@${bot.id}>\n`
        }
        let e = new Discord.RichEmbed()
        .setTitle('Bots')
        .setDescription(cont)
        .setColor(0x6b83aa)
        if (un) e.setFooter(`Bots with strikethrough are unverified.`)
        channel.send(e)
      })
      break;
      
    case "verify":
      if (!admins.includes(sender.id)) return;
      Manager.verify(args[0]).then(res => {
        let e = new Discord.RichEmbed()
          .setTitle('Bot Verified')
          .addField(`Bot`, `<@${res.id}>`, true)
          .addField(`Owner`, `<@${res.owner}>`, true)
          .addField("Mod", message.author, true)
          .setThumbnail(res.logo)
          .setTimestamp()
          .setColor(0x26ff00)
        modLog.send(e);
        modLog.send(`<@${res.owner}>`).then(m => {m.delete()});
        
        message.guild.fetchMember(message.client.users.find(u => u.id === res.owner)).then(owner => {
          owner.addRole("482883261639557131")
        })
        message.guild.fetchMember(message.client.users.find(u => u.id === res.id)).then(bot => {
          bot.setRoles(["482882920894300160", "482882854175637504"]) // Bot and verified
        })
        channel.send(`Verified \`${res.name}\``);
      })
      break;
    case "botinfo":
      let pingy = message.mentions.users.first();
      if (!pingy) return channel.send(`Mention a bot to get info about.`)
      if (!pingy.bot) return channel.send(`Mention a bot to get info about.`)
      Manager.fetch(pingy.id).then(ans => {
        if (ans === "false") return channel.send(`Bot not found.`)
        ans = ans.bot;
        let e = new Discord.RichEmbed()
        .setColor(0x6b83aa)
        .setAuthor(ans.name, ans.logo, ans.invite)
        .setDescription(ans.description)
        .addField(`Prefix`, ans.prefix, true)
        .addField(`Owner`, `<@${ans.owner}>`, true)
        .addField(`State`, ans.state.capitalize(), true)
        channel.send(e);
      })
      break;
    case "queue":
    case "q":
      if (!admins.includes(sender.id)) return;
      let e = new Discord.RichEmbed()
        .setTitle('Queue')
        .setColor(0x6b83aa)
      let cont = "";
      Manager.queue().then(res => {
        res.forEach(bot => {cont += `<@${bot.id}> : [Invite](https://discordapp.com/oauth2/authorize?client_id=${bot.id}&scope=bot&guild_id=477792727577395210&permissions=0)\n`})
        if (res.length === 0) e.setDescription("Queue is empty")
        else e.setDescription(cont)
        channel.send(e)
      });
      break;
    case "drop":
      if (!admins.includes(sender.id)) return;
      channel.send(`Are you sure you want to wipe the bot database? (YES | NO)`)
      message.channel.awaitMessages(filter, { max: 1, time: 20000, errors: ['time'] })
        .then(collected => {
          let resp = collected.first().content
          if (resp === "YES") {
            Manager.drop()
            channel.send(`Database dropped.`)
          } else channel.send("Cancelled")
        })
      break;
    case "remove":
      let botId = args[0]
      if (!admins.includes(sender.id)) return;
      
      let e2 = new Discord.RichEmbed()
      .setTitle('Reasons')
      .setColor(0x6b83aa)
      .addField(`Removing bot`, `<@${botId}>`)
      let cont2 = ``;
      for (let k in reasons) {
        let r = reasons[k];
        cont2 += ` - **${k}**: ${r}\n`
      }
      cont2 += `\nEnter a valid reason number or your own reason.`
      e2.setDescription(cont2)
      message.channel.send(e2)
      message.channel.awaitMessages(filter, { max: 1, time: 20000, errors: ['time'] })
        .then(collected => {
          let reason = collected.first().content
          if (parseInt(reason)) {
            let r = reasons[reason]
            if (!r) return message.channel.send("Inavlid reason number.")
            Manager.remove(botId).then(res => {
              let e = new Discord.RichEmbed()
              .setTitle('Bot Removed')
              .addField(`Bot`, `<@${res.id}>`, true)
              .addField(`Owner`, `<@${res.owner}>`, true)
              .addField("Mod", message.author, true)
              .addField("Reason", r)
              .setThumbnail(res.logo)
              .setTimestamp()
              .setColor(0xffaa00)
              modLog.send(e)
              modLog.send(`<@${res.owner}>`).then(m => {m.delete()})
              channel.send(`Removed <@${res.id}> Check <#481845465298501632>.`)
              
              if (!message.client.users.find(u => u.id===res.id).bot) return;
              try {
                message.guild.fetchMember(message.client.users.find(u => u.id===res.id))
                  .then(bot => {bot.kick().then(() => {})
                  .catch(e => {console.log(e)})}).catch(e => {console.log(e)});
              } catch(e) {console.log(e)}
            })
          } else {
            let r = collected.first().content;
            if (r === "cancel") return message.channel.send(`Cancelled.`)
            Manager.remove(botId).then(res => {
              let e = new Discord.RichEmbed()
              .setTitle('Bot Removed')
              .addField(`Bot`, `<@${res.id}>`, true)
              .addField(`Owner`, `<@${res.owner}>`, true)
              .addField("Mod", message.author, true)
              .addField("Reason", r)
              .setThumbnail(res.logo)
              .setTimestamp()
              .setColor(0xffaa00)
              modLog.send(e)
              modLog.send(`<@${res.owner}>`).then(m => {m.delete()})
              channel.send(`Removed <@${res.id}> Check <#481845465298501632>.`)
              
              if (!message.client.users.find(u => u.id===res.id).bot) return;
              try {
                message.guild.fetchMember(message.client.users.find(u => u.id===res.id))
                  .then(bot => {bot.kick().then(() => {})
                  .catch(e => {console.log(e)})}).catch(e => {console.log(e)});
              } catch(e) {console.log(e)}
            })
          }
      })
        .catch(collected => channel.send(`Timed out.`));
    break;
    
  }
})


CLIENT.on('guildMemberAdd', member => {
  if (member.user.bot) {
    member.addRole("482882854175637504") // Bot role
    member.addRole("482882886471647232") // Unverified role
  }
})

CLIENT.login(process.env.token)