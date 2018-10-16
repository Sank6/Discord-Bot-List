var express = require('express');
var didyoumean = require('didyoumean');
var request = require('request');
const is  = require('is-html');
const url  = require('is-url');
const showdown  = require('showdown');
const { Canvas } = require('canvas-constructor');
var Frame  = require('canvas-to-buffer')

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

app.get("/api/embed/:id", (req, res) => {
  Manager.fetch(req.params.id).then(async resp => {
    if (!resp) return res.sendStatus(404);
    let owner = await CLIENT.guilds.first().members.fetch(resp.bot.owner);
    let lg = resp.bot.logo.replace("webp", "png?size=512");
    let avatar = await fetch(lg).then(res => res.buffer());
    let template = await fetch("https://pls-m.urder.me/i/t0is4.png").then(res => res.buffer());
    
    let img = new Canvas(500, 200)
    .addImage(template, 0, 0, 500, 200)
    .setColor("#2C2F33")
    .addBeveledRect(40, 40, 420, 50, 10)
    .addBeveledRect(40, 105, 80, 80, 10)
    .addBeveledRect(130, 105, 330, 35, 10)
    .addBeveledRect(130, 150, 330, 35, 10)
    .setColor("#ffffff")
    .setTextAlign('center')
    .setTextSize(35)
    .addText(resp.bot.name, 250, 77)
    .addImage(avatar, 45, 110, 70, 70, {radius: 100, type: "bevel", restore: true})
    .setColor('#2C2F33')
    .addBeveledRect(95, 160, 20, 20, 100)
    .setColor('#3bff00')
    .addBeveledRect(98, 163, 17, 17, 100)

    .setColor('#FFFFFF')
    .setTextAlign('left')
    .setTextSize(20)
    .addText(`Made by: ${owner.user.tag}`, 140, 130)
    .addText(`Servers: ${resp.bot.servers ? resp.bot.servers : "Unknown"}`, 140, 175)

    .setTextSize(10)
    .setTextAlign('right')
    .addText("discordbotlist.xyz", 490, 20)
    
    res.writeHead(200, {'Content-Type': 'image/png' });
    res.end(await img.toBuffer(), 'binary')
  })
})

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
  if (response === false) return res.sendStatus(404);
  console.log(response.bot.owner);
  let person
  try {
    person = await CLIENT.guilds.first().members.fetch(response.bot.owner);
  } catch (e) {
    person = {
      user: {
        "tag": "Unknown User"
      }
    }
  }
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
          <td class="tg-0lax">${person.user.tag}</td>
        </tr>
      </table>
      <div id="long">
        <span class="${isUrl ? "" : "markdown-body"}"> ${desc} </span>
      </div>
      <div id="inv" class="linkx"> <a target="_blank" href="${response.bot.invite ? response.bot.invite : `https://discordapp.com/oauth2/authorize?client_id=${response.bot.id}&scope=bot&permissions=0`}">Invite Link</a> </div>
      <div id="edit"class="linkx" style="display: none;"> <a target="_blank" href="https://discordbotlist.xyz/edit/${response.bot.id}">Edit</a> </div>
      <div id="by">Made by ${`${person.user.tag}`}</div>
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
    if (response === false) return res.sendStatus(404);
    let bot = response.bot;
    if (bot.owner === "") bot.presentable === true;
    res.render("edit/index", {bot: bot})
  });
});


app.get("/new/",  function (req, res) {
  let data = JSON.parse(req.query.data);
  let url = `https://dbots-listing.glitch.me/api/get?token=${encodeURIComponent(data.token)}`
  let url2 = `https://dbots-listing.glitch.me/api/get/bot/?token=${data.token}&id=${encodeURIComponent(data.id)}`

  if (data.short.length >= 120) return res.redirect("/error?e=long")
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
      if (data.short.length >= 120) return res.redirect(`/error?e=long`)
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
      if (bot.owner !== user.id && user.id !== "297403616468140032") return res.json({"success":"false", "error": "Bot owner is not user."});
      if (!bot.auth) { 
        bot.auth = create(20);
        Manager.update(botId, bot);
        res.json({"success": "true", "Authorization Token": bot.auth});
      } else {
        res.json({"success": "true", "Authorization Token": bot.auth});
      }
    });
  });
});

app.get("/api/auth/reset/:id", (req, res) => {
  let token = req.query.token;
  let botId = req.params.id;
  if (!token) return res.json({"success":"false", "error": "Invalid token"})
  let url = `https://dbots-listing.glitch.me/api/get?token=${encodeURIComponent(token)}`;
  request({url: url, json: true}, function (err1, res1, body) {
    Manager.fetch(botId).then(ans => {
      console.log(body)
      let bot = ans.bot;
      let user = body[0];
      if (bot.owner !== user.id && user.id !== "297403616468140032") return res.json({"success":"false", "error": "Bot owner is not user."});
      bot.auth = create(20);
      Manager.update(botId, bot);
      res.json({"success": "true", "New Authorization Token": bot.auth});
    });
  });
});

app.post('/api/stats/:id', (req, res) => {
  let botId = req.params.id;
  
  let auth = req.headers.authorization;
  if (!auth) return res.json({"success": "false", "error": "Authorization header not found."});
  let count = req.body.count ? req.body.count : req.body.server_count;
  
  if (!count) return res.json({"success": "false", "error": "Count not found in body."});
  count = parseInt(count);
  if (!count) return res.json({"success": "false", "error": "Count not integer."});
  Manager.fetch(botId).then(ans => {
    let bot = ans.bot;
    if (!bot) return res.json({"success": "false", "error": "Bot not found."});
    if (!bot.auth) return res.json({"success": "false", "error": "Create a bot authorization token."});
    if (bot.auth !== auth) return res.json({"success": "false", "error": "Incorrect authorization token."});
    bot.servers = count;
    Manager.update(botId, bot).then(() => {
      delete bot.auth;
      res.json({"success": "true", "bot": bot});
    })
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
  res.redirect(`https://discordapp.com/api/oauth2/authorize?client_id=477793621509144576&response_type=code&scope=identify`);
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
    CLIENT.guilds.first().members.fetch().then(ans => {
      let people = ans.map(p => p.id);
      if (people.includes(find)) res.send(true);
      else res.send(false)
    });
  });
});


/* web stuff above this */
const Discord = require('discord.js');
const { Client } = require('klasa');
const CLIENT = new Client({
  commandEditing: true,
  prefix: "-",
  providers: {
    default: "mongodb",
    mongodb: { db: "dbots-klasa" }
  },
  pieceDefaults: { commands: {
      promptLimit: Infinity, promptTime: 60000
  } }
});

CLIENT.on('eventError', e => {throw new Error(e);});
CLIENT.on('commandError', e => {throw new Error(e);});
CLIENT.on('finalizerError', e => {throw new Error(e);});
CLIENT.on('monitorError', e => {throw new Error(e);});
CLIENT.on('taskError', e => {throw new Error(e);});
CLIENT.on('userUpdate', () => { Manager.updateBots(CLIENT) });
CLIENT.on('guildMemberAdd', member => {
  if (member.user.bot) {
    member.roles.add(member.guild.roles.get("482882854175637504")); // Bot role
    member.roles.add(member.guild.roles.get("482882886471647232")); // Unverified role
  }
})

CLIENT.login(process.env.token)
