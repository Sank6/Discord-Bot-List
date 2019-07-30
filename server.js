require('dotenv').config()
var express = require('express');
var didyoumean = require('didyoumean');
var fetch = require('node-fetch')
const is = require('is-html');
const url = require('is-url');
const showdown = require('showdown');
const { Canvas } = require('canvas-constructor');
var Frame = require('canvas-to-buffer')

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

var listener = app.listen("80", function() {
    console.log('Your app is listening on port ' + listener.address().port);
});

app.get('/', function(request, response) {
    if (!request.query.q) response.sendFile(__dirname + '/views/index.html');
    else response.redirect(`/search?q=${encodeURIComponent(request.query.q)}`)
});

app.get("/api/search", async(req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    let results = await Manager.search(req.query.q)
    res.json(results)
});

app.get("/api/embed/:id", async(req, res) => {
    let resp = await Manager.fetch(req.params.id)

    if (!resp) return res.sendStatus(404);
    let owner = await CLIENT.guilds.get(process.env.GUILD_ID).members.fetch(resp.bot.owner);
    let lg = resp.bot.logo.replace("webp", "png?size=512");
    let avatar = await fetch(lg).then(res => res.buffer());

    let img = new Canvas(500, 200)
        .setColor("#2C2F33")
        .addBeveledRect(40, 40, 420, 50, 10)
        .addBeveledRect(40, 105, 80, 80, 10)
        .addBeveledRect(130, 105, 330, 35, 10)
        .addBeveledRect(130, 150, 330, 35, 10)
        .setColor("#ffffff")
        .setTextAlign('center')
        .setTextSize(35)
        .addText(resp.bot.name, 250, 77)
        .addImage(avatar, 45, 110, 70, 70, { radius: 100, type: "bevel", restore: true })
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

    res.writeHead(200, { 'Content-Type': 'image/png' });
    res.end(await img.toBuffer(), 'binary')
})

app.get('/remove', async(req, res) => {
    let ans = await Manager.remove(JSON.parse(req.query.bot))
    res.send(ans)
});

app.get('/list', async(req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type'); // If needed
    res.setHeader('Access-Control-Allow-Credentials', true); // If needed
    let result = await Manager.fetchAll()
    result.forEach(b => { delete b.bot.auth })
    res.send(result)
})

app.get('/search', async(req, res) => {
    let search = decodeURIComponent(req.query.search)
    let names = []
    let result = await Manager.fetchAll()

    result.forEach(function(bot) {
        names.push(bot.name)
    })
    let ans = didyoumean(search, names)
    if (ans == null) return res.send({ error: "No bots found for this search" })
    let i = names.indexOf(ans)
    res.send({ "search": search, "result": result[i] })
});


app.get('/bots/:id', async(req, res) => {
    let result = await Manager.fetch(req.params.id)
    if (result === false) return res.sendStatus(404);
    let person
    try {
        person = await CLIENT.guilds.get(process.env.GUILD_ID).members.fetch(result.bot.owner);
    } catch (e) {
        person = {
            "user": { "tag": "Unknown User" }
        }
    }
    let b = "#8c8c8c";
    try {
        let c = await CLIENT.users.find(u => u.id === result.bot.id).presence.status
        switch (c) {
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

    } catch (e) {
        console.log(e)
        b = "#8c8c8c"
    };


    var desc = ``;
    let isUrl = url(result.bot.long.replace("\n", "").replace(" ", ""))
    if (isUrl) desc = `<object data="${response.bot.long.replace("\n", "").replace(" ", "")}" width="600" height="400" style="width: 100%; height: 100vh;"><embed src="${result.bot.long.replace("\n", "").replace(" ", "")}" width="600" height="400" style="width: 100%; height: 100vh;"> </embed>${result.bot.long.replace("\n", "").replace(" ", "")} </object>`;

    else if (result.bot.long) desc = converter.makeHtml(result.bot.long);
    else desc = result.bot.description;
    res.render('bot', { response: result, person: person, desc: desc, isUrl: isUrl })
});

app.get('/edit/:id', async(req, res) => {
    let response = await Manager.fetch(req.params.id)
    if (response === false) return res.sendStatus(404);
    let bot = response.bot;
    if (bot.owner === "") bot.presentable === true;
    res.render("edit/index", { bot: bot })
});


app.get("/new/", async(req, res) => {
    let data = JSON.parse(req.query.data);
    if (data.short.length >= 120) return res.redirect("/error?e=long")

    let user = await get(data.token)
    if (!user) return res.redirect("/error?e=user")

    let [bot] = await getBot(data.id)
    if (bot.user_id && bot.user_id[0].endsWith("is not snowflake.")) return res.redirect("/error?e=unknown")
    if (bot.message == "Unknown User") return res.redirect("/error?e=n");
    if (bot.bot !== true) return res.redirect("/error?e=human")

    let m = await members(data.token);
    if (m == "false") return res.redirect("/error?e=server");

    let newBot = {
        name: bot.username,
        id: bot.id,
        logo: `https://cdn.discordapp.com/avatars/${bot.id}/${bot.avatar}.png`,
        invite: data.link,
        description: data.short,
        long: data.long,
        prefix: data.prefix,
        state: "unverified",
        owner: user.id
    };

    if (is(newBot.long)) return res.redirect("/error?e=html");
    let rt = /(?:https|http)\:\/\/discordapp\.com\/oauth2\/authorize\?(?:scope=bot\&client_id=[0-9]+\&permissions=(-)?[0-9]+|scope=bot\&permissions=(-)?[0-9]+client_id=[0-9]+|client_id=[0-9]+\&scope=bot&permissions=(-)?[0-9]+|client_id=[0-9]+\&permissions=[0-9]+&scope=bot|permissions=(-)?[0-9]+\&client_id=[0-9]+\&scope=bot|permissions=(-)?[0-9]+\&scope=bot&client_id=[0-9]+)/gm
    let a = data.link.match(rt);
    if (!a && data.link !== "") return res.redirect(`/error?e=invite`);

    let ans = await Manager.fetch(newBot.id)
    if (ans == false) {
        await Manager.add(newBot)
        let r = CLIENT.guilds.get(process.env.GUILD_ID).roles.find(r => r.id === process.env.MOD_LOG_ID);
        await r.setMentionable(true)
        await CLIENT.guilds.get(process.env.GUILD_ID).channels.find(c => c.id === process.env.MOD_LOG_ID).send(`<@${newBot.owner}> added <@${newBot.id}>: ${r}`)
        r.setMentionable(false)
        res.redirect("/success")
    } else res.redirect(`/error?e=${ans.bot.state}`)
})



app.get("/modify/", function(req, res) {
    let data = JSON.parse(req.query.data);

    let [user] = await get(token);
    let { bot } = await Manager.fetch(botId)

    let rt = /(?:https|http)\:\/\/discordapp\.com\/oauth2\/authorize\?(?:scope=bot\&client_id=[0-9]+\&permissions=[0-9]+|scope=bot\&permissions=[0-9]+client_id=[0-9]+|client_id=[0-9]+\&scope=bot&permissions=[0-9]+|client_id=[0-9]+\&permissions=[0-9]+&scope=bot|permissions=[0-9]+\&client_id=[0-9]+\&scope=bot|permissions=[0-9]+\&scope=bot&client_id=[0-9]+)/gm
    let a = data.link.match(rt);

    if (body[0].message === "401: Unauthorized") return res.redirect("/error?e=user")
    if (bot.owner !== user.id && !process.env.ADMIN_USERS.split(' ').includes(user.id))
        return res.redirect(`/error?e=owner`);
    if (bot.id !== data.id) return res.redirect(`/error?e=id`);
    if (data.short.length >= 120) return res.redirect(`/error?e=long`)
    if (!a && data.link !== "") return res.redirect(`/error?e=invite`);
    if (is(data.long)) return res.redirect(`/error?e=html`);

    bot.invite = data.link;
    bot.description = data.short;
    bot.long = data.long;
    bot.prefix = data.prefix;

    Manager.update(bot.id, bot);

    CLIENT.guilds.get(process.env.GUILD_ID).channels.find(c => c.id === process.env.MOD_LOG_ID).send(`<@${user.id}> has updated <@${bot.id}>`)
    res.redirect(`/bots/${bot.id}`);

});

app.get("/api/auth/:id", (req, res) => {
    let token = req.query.token;
    let botId = req.params.id;
    if (!token) return res.json({ "success": "false", "error": "Invalid token" })

    let [user] = await get(token);
    let { bot } = await Manager.fetch(botId)

    if (bot.owner !== user.id && !process.env.ADMIN_USERS.split(' ').includes(user.id)) return res.json({ "success": "false", "error": "Bot owner is not user." });
    if (!bot.auth) {
        bot.auth = create(20);
        Manager.update(botId, bot);
        res.json({ "success": "true", "Authorization Token": bot.auth });
    } else {
        res.json({ "success": "true", "Authorization Token": bot.auth });
    }
});

app.get("/api/auth/reset/:id", async(req, res) => {
    let token = req.query.token;
    let botId = req.params.id;
    if (!token) return res.json({ "success": "false", "error": "Invalid token" })

    let [user] = await get(token);
    let { bot } = await Manager.fetch(botId)

    if (bot.owner !== user.id && !process.env.ADMIN_USERS.split(' ').includes(user.id)) return res.json({ "success": "false", "error": "Bot owner is not user." });
    bot.auth = create(20);
    Manager.update(botId, bot);
    res.json({ "success": "true", "New Authorization Token": bot.auth });

});

app.post('/api/stats/:id', async(req, res) => {
    let botId = req.params.id;

    let auth = req.headers.authorization;
    if (!auth) return res.json({ "success": "false", "error": "Authorization header not found." });
    let count = req.body.count ? req.body.count : req.body.server_count;

    if (!count) return res.json({ "success": "false", "error": "Count not found in body." });
    count = parseInt(count);
    if (!count) return res.json({ "success": "false", "error": "Count not integer." });
    let ans = await Manager.fetch(botId)
    let bot = ans.bot;
    if (!bot) return res.json({ "success": "false", "error": "Bot not found." });
    if (!bot.auth) return res.json({ "success": "false", "error": "Create a bot authorization token." });
    if (bot.auth !== auth) return res.json({ "success": "false", "error": "Incorrect authorization token." });
    bot.servers = count;
    await Manager.update(botId, bot)
    delete bot.auth;
    res.json({ "success": "true", "bot": bot });
});

// Discord Stuff
const { CLIENT_ID, CLIENT_SECRET } = process.env;
const redirect = encodeURIComponent(process.env.DOMAIN + '/api/discord/callback');
const catchAsync = fn => ((req, res, next) => {
    const routePromise = fn(req, res, next);
    if (routePromise.catch) { routePromise.catch(err => next(err)); }
});
const unirest = require('unirest');
const btoa = require('btoa');

let get = (token) => {
    return new Promise(function(resolve, reject) {
        let data = []
        unirest.get("https://discordapp.com/api/users/@me").headers({ 'Authorization': `Bearer ${token}` }).end(function(user) {
            if (user["raw_body"].error) return resolve(false)
            data.push(JSON.parse(user["raw_body"]));
            resolve(data)
        });
    })
}

let getBot = (id) => {
    return new Promise(function(resolve, reject) {
        let data = []
        unirest.get(`https://discordapp.com/api/users/${id}`).headers({ 'Authorization': `Bot ${process.env.token}` }).end(function(user) {
            if (user["raw_body"].error) return resolve(false)
            data.push(JSON.parse(user["raw_body"]));
            resolve(data)
        });
    })
}

let members = (token) => {
    return new Promise(function(resolve, reject) {
        unirest.get("https://discordapp.com/api/users/@me").headers({ 'Authorization': `Bearer ${req.query.token}` }).end(async function(user) {
            if (user["raw_body"].error) return resolve(false);
            let find = JSON.parse(user["raw_body"]).id;
            let ans = await CLIENT.guilds.get(process.env.GUILD_ID).members.fetch()
            let people = ans.map(p => p.id);
            if (people.includes(find)) resolve(true);
            else resolve(false)
        });
    })
}


app.get('/api/discord/login', (req, res) => {
    res.redirect(`https://discordapp.com/api/oauth2/authorize?client_id=${CLIENT_ID}&response_type=code&scope=identify`);
});

app.get('/api/discord/callback', catchAsync(async(req, res) => {
    if (!req.query.code) throw new Error('NoCodeProvided');
    const code = req.query.code;
    const creds = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
    const response = await fetch(`https://discordapp.com/api/oauth2/token?grant_type=authorization_code&code=${code}`, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${creds}`,
        },
    });
    const json = await response.json();
    res.redirect(`/api/store?token="${json.access_token}"`);
}));

app.get('/api/store', (req, res) => {
    res.send(`<script>localStorage.setItem("token", ${req.query.token});window.location.href="/"</script>`)
})

app.get('/api/get', (req, res) => {
    res.send(await get(req.query.token))
});

app.get('/api/get/bot/', (req, res) => {
    res.send(await getBot(req.query.id))
});


app.get('/api/bot', (req, res) => {
    res.send({ "success": "false", "error": "Bot id not provided" })
});
app.get('/api/bot/:id', async(req, res) => {
    let result = await Manager.fetch(req.params.id)
    if (result === false) return res.send({ "success": "false", "error": "Bot not found" })
    delete result.bot.auth;
    result.bot.success = "true";
    res.send(result.bot);
});

app.get('/api/members', async(req, res) => {
    res.send(await members(req.query.token))
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
    pieceDefaults: {
        commands: {
            promptLimit: Infinity,
            promptTime: 60000
        }
    }
});

CLIENT.on('eventError', e => { throw new Error(e); });
CLIENT.on('commandError', e => { throw new Error(e); });
CLIENT.on('finalizerError', e => { throw new Error(e); });
CLIENT.on('monitorError', e => { throw new Error(e); });
CLIENT.on('taskError', e => { throw new Error(e); });
CLIENT.on('userUpdate', () => { Manager.updateBots(CLIENT) });
CLIENT.on('guildMemberAdd', member => {
    if (member.user.bot) {
        member.roles.add(member.guild.roles.get(process.env.BOT_ROLE_ID)); // Bot role
        member.roles.add(member.guild.roles.get(process.env.UNVERIFIED_ROLE_ID)); // Unverified role
    }
})

CLIENT.login(process.env.token)