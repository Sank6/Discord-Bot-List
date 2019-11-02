require('dotenv').config()
var express = require('express');
var fetch = require('node-fetch')
const is = require('is-html');
const url = require('is-url');
const showdown = require('showdown');
const { Canvas } = require('canvas-constructor');
var bodyParser = require('body-parser');

const converter = new showdown.Converter();
converter.setOption('tables', 'true');

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
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());


var listener = app.listen("80", function() {
    console.log('Your app is listening on port ' + listener.address().port);
});

app.get('/', function(request, response) {
    if (!request.query.q) response.sendFile(__dirname + '/views/index.html');
    else response.redirect(`/search?q=${encodeURIComponent(request.query.q)}`)
});

app.get('/join', async(req, res) => {
    res.redirect(process.env.GUILD_INVITE)
})

app.get('/avatar', async(req, res) => {
    let a = req.query.avatar;
    let got = await fetch(a);
    got = await got.buffer();
    res.writeHead(200, { 'Content-Type': 'image/png' });
    res.end(got, 'binary');
});

app.get("/api/search", (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);

    let q = req.query.q.toLowerCase()
    let ans = JSON.parse(CLIENT.settings.get('bots')).filter(u => u.long.toLowerCase().includes(q) || u.description.toLowerCase().includes(q));
    res.json(ans);
});

app.get("/embed/:id", async(req, res) => {
    let resp = JSON.parse(CLIENT.settings.get('bots')).find(u => u.id === req.params.id);

    if (!resp) return res.sendStatus(404);
    let owner = await CLIENT.guilds.first().members.fetch(resp.owners[0]);
    let lg = decodeURIComponent(resp.logo.replace('/avatar/?avatar=', "")).replace("webp", "png?size=512");
    let avatar = await fetch(lg).then(res => res.buffer());

    let img = new Canvas(500, 200)
        .setColor("#ffffff")
        .addRect(0, 0, 500, 200)
        .setColor("#888888")
        .addBeveledRect(39, 29, 422, 52, 2)
        .setColor("#ffffff")
        .addBeveledRect(40, 30, 420, 50, 2)
        .setColor("#888888")
        .setTextAlign('center')
        .setTextSize(35)
        .addText(resp.name, 250, 67)
        .addCircularImage(avatar, 80, 135, 40, 40, 5, true)
        .setTextAlign('left')
        .setTextSize(12)
    if (resp.servers) img.addText(`${resp.servers} servers`, 140, 105)
    img.addText(`Prefix: ${resp.prefix}`, 140, 125)
        .setTextSize(11)
        .addMultilineText(resp.description, 140, 145, 320, 15)

    .setTextSize(10)
        .setTextAlign('right')
        .addText(process.env.DOMAIN, 490, 195)
        .setTextAlign('left')
        .addText(owner.user.tag, 10, 195)

    res.writeHead(200, { 'Content-Type': 'image/png' });
    res.end(await img.toBuffer(), 'binary')
});

app.get('/list', function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type'); // If needed
    res.setHeader('Access-Control-Allow-Credentials', true); // If needed
    let ans = JSON.parse(CLIENT.settings.get('bots'))

    ans.forEach(b => { delete b.auth })
    res.send(ans)
})

app.get('/search', async(req, res) => {
    let search = req.query.q;
    if (!search) search = "";
    search = search.toLowerCase();
    let result = await fetch(`${process.env.DOMAIN}/list`);
    result = await result.json();

    let found = result.filter(bot => {
        if (bot.name.toLowerCase().includes(search)) return true;
        else if (bot.description.toLowerCase().includes(search)) return true;
        else return false;
    });
    if (!found) return res.send({ error: "No bots found for this search" });
    let data = {
        cards: found,
        search: search
    };
    res.render("search/index", data);
});

app.get('/user/:id', async(req, res) => {
    let user = CLIENT.users.get(req.params.id);
    if (!user) return res.render("user/notfound", {})

    let bots = JSON.parse(CLIENT.settings.get('bots')).filter(b => b.owners.includes(req.params.id));

    if (bots.length === 0) return res.render("user/notfound", {})
    let data = {
        user: user,
        cards: bots
    }
    res.render("user/index", data);
});

app.get('/me', async(req, res) => {
    if (!req.query.token) res.sendFile(__dirname + '/views/me/index.html');
    else {
        let [user] = await get(req.query.token)
        user = CLIENT.users.get(user.id);
        if (!user) return res.render("user/notfound", {})

        let bots = JSON.parse(CLIENT.settings.get('bots')).filter(b => b.owners.includes(user.id));
        let data = {
            user: user,
            cards: bots
        }
        res.render("user/me", data);
    }
})


app.get('/bots/:id', async function(req, res) {
    let response = JSON.parse(CLIENT.settings.get('bots')).find(u => u.id === req.params.id);
    if (response.state === "deleted") return res.sendStatus(404);
    if (!response) return res.sendStatus(404);
    let person
    try {
        person = await CLIENT.guilds.get(process.env.GUILD_ID).members.fetch(response.owners[0]);
    } catch (e) {
        person = {
            user: {
                "tag": "Unknown User"
            }
        }
    }
    let b = "#8c8c8c";
    try {
        let c = await CLIENT.users.find(u => u.id === response.id).presence.status
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
        console.error(e)
        console.log(req.params.id)
        b = "#8c8c8c"
    };
    var desc = ``;
    let isUrl = url(response.long.replace("\n", "").replace(" ", ""))
    if (isUrl) {
        desc = `<iframe src="${response.long.replace("\n", "").replace(" ", "")}" width="600" height="400" style="width: 100%; height: 100vh;"><object data="${response.long.replace("\n", "").replace(" ", "")}" width="600" height="400" style="width: 100%; height: 100vh;"><embed src="${response.long.replace("\n", "").replace(" ", "")}" width="600" height="400" style="width: 100%; height: 100vh;"> </embed>${response.long.replace("\n", "").replace(" ", "")}</object></iframe>`
    } else if (response.long) desc = converter.makeHtml(response.long);
    else desc = response.description;
    let data = {
        response: response,
        person: person,
        bcolour: b,
        desc: desc,
        isURL: isUrl
    };
    res.render("bots/index", data);
});

app.get('/edit/:id', async function(req, res) {
    let bot = JSON.parse(CLIENT.settings.get('bots')).find(u => u.id === req.params.id);

    if (!bot) return res.sendStatus(404);
    res.render("edit/index", { bot: bot });
});

app.get('/resubmit/:id', async function(req, res) {
    let bot = JSON.parse(CLIENT.settings.get('bots')).find(u => u.id === req.params.id);

    if (!bot) return res.sendStatus(404);
    if (bot.state !== "deleted") return res.sendStatus(404);
    res.render("resubmit/index", { bot: bot });
});

app.post("/new/", async(req, res) => {
    let data = req.body;

    if (data.short.length > 120) return res.json({"redirect": "/error?e=long"});

    let [user] = await get(data.token);
    let [bot] = await getBot(data.id);

    let memberCheck = await members(data.token);

    if (user.message === "401: Unauthorized") return res.json({"redirect": "/error?e=user"})
    if (memberCheck == false) return res.json({"redirect": "/error?e=server"})

    if (bot.user_id && bot.user_id[0].endsWith("is not snowflake.")) return res.json({"redirect": "/error?e=unknown"})
    if (bot.message == "Unknown User") return res.json({"redirect": "/error?e=unknown"})
    if (bot.bot !== true) return res.json({"redirect": "/error?e=human"});

    let owners = [user.id];
    owners = owners.concat(data.owners.replace(',', '').split(' ').remove(''));
    let newBot = {
        name: bot.username,
        id: bot.id,
        logo: `https://cdn.discordapp.com/avatars/${bot.id}/${bot.avatar}.png`,
        invite: data.invite,
        description: data.short,
        long: data.long,
        prefix: data.prefix,
        state: "unverified",
        owners: owners
    };

    if (is(newBot.long) || is(data.short)) return res.json({"redirect": "/error?e=html"});
    let ans = JSON.parse(CLIENT.settings.get('bots')).find(u => u.id == bot.id);

    if (ans !== undefined && ans.state !== "deleted") return res.json({"redirect": `/error?e=${ans.state}`});
    let n = JSON.parse(CLIENT.settings.get('bots'));
    if (ans === undefined) n.push(newBot)
    else {
        n.find(u => u.id == bot.id).name = bot.username
        n.find(u => u.id == bot.id).id = bot.id
        n.find(u => u.id == bot.id).logo = `https://cdn.discordapp.com/avatars/${bot.id}/${bot.avatar}.png`
        n.find(u => u.id == bot.id).invite = data.invite
        n.find(u => u.id == bot.id).description = data.short
        n.find(u => u.id == bot.id).long = data.long
        n.find(u => u.id == bot.id).prefix = data.prefix
        n.find(u => u.id == bot.id).state = "unverified"
        n.find(u => u.id == bot.id).owners = owners
    }
    CLIENT.settings.update("bots", JSON.stringify(n))

    try {
        let r = CLIENT.guilds.get(process.env.GUILD_ID).roles.find(r => r.id === process.env.BOT_VERIFIERS_ROLE_ID);
        await r.setMentionable(true)
        await CLIENT.guilds.get(process.env.GUILD_ID).channels.find(c => c.id === process.env.MOD_LOG_ID).send(`<@${newBot.owners[0]}> added <@${newBot.id}>: ${r}`);
        r.setMentionable(false);
        res.json({"redirect": "/success"});
    } catch (e) { console.error(e) }
})

app.post("/modify", async(req, res) => {
    let data = req.body;

    let [user] = await get(data.token);

    let bot = JSON.parse(CLIENT.settings.get('bots')).find(u => u.id === data.id);

    if (!bot) return res.redirect("/error?e=wot")
    if (user.message === "401: Unauthorized") return res.redirect("/error?e=user")
    if (!bot.owners.includes(user.id) && process.env.ADMIN_USERS.split(' ').includes(user.id)) return res.redirect(`/error?e=owner`);
    if (bot.id !== data.id) return res.redirect(`/error?e=id`);
    if (data.short.length >= 120) return res.redirect(`/error?e=long`)
    if (is(data.long) || is(data.short)) return res.redirect(`/error?e=html`);

    let updated = JSON.parse(CLIENT.settings.get('bots'));
    updated.find(u => u.id === data.id).long = data.long;
    updated.find(u => u.id === data.id).description = data.short;
    updated.find(u => u.id === data.id).invite = data.link;
    updated.find(u => u.id === data.id).prefix = data.prefix;
    CLIENT.settings.update("bots", JSON.stringify(updated));

    CLIENT.guilds.get(process.env.GUILD_ID).channels.find(c => c.id === process.env.MOD_LOG_ID).send(`<@${user.id}> has updated <@${bot.id}>`)
    res.redirect(`/bots/${bot.id}`);
});

app.get('/bio', (req, res) => {
    let token = req.query.token;
    let bio = req.query.bio;
})

app.get("/api/auth/:id", async(req, res) => {
    let token = req.query.token;
    let botId = req.params.id;
    if (!token) return res.json({ "success": "false", "error": "Invalid token" })

    let [user] = await get(token);

    let bot = JSON.parse(CLIENT.settings.get('bots')).find(u => u.id === req.params.id);

    if (!bot) return res.json({ "success": "false", "error": "Bot not found." });
    if (!bot.owners.includes(user.id) && process.env.ADMIN_USERS.split(' ').includes(user.id)) return res.json({ "success": "false", "error": "Bot owner is not user." });
    if (!bot.auth) {
        let updated = JSON.parse(CLIENT.settings.get('bots'));
        updated.find(u => u.id === req.params.id).auth = create(20);
        CLIENT.settings.update("bots", JSON.stringify(updated));
        res.json({ "success": "true", "Authorization Token": updated.find(u => u.id === req.params.id).auth });
    } else {
        res.json({ "success": "true", "Authorization Token": bot.auth });
    }
});

app.get("/api/auth/reset/:id", async(req, res) => {
    let token = req.query.token;
    if (!token) return res.json({ "success": "false", "error": "Invalid token" })

    let [user] = await get(token);

    let bot = JSON.parse(CLIENT.settings.get('bots')).find(u => u.id === req.params.id);
    if (bot.owner !== user.id && process.env.ADMIN_USERS.split(' ').includes(user.id))
        return res.json({ "success": "false", "error": "Bot owner is not user." });

    let updated = JSON.parse(CLIENT.settings.get('bots'));
    updated.find(u => u.id === req.params.id).auth = create(20);
    CLIENT.settings.update("bots", JSON.stringify(updated));

    res.json({ "success": "true", "New Authorization Token": bot.auth });
});

app.post('/api/stats/:id', (req, res) => {
    let botId = req.params.id;
    let auth = req.headers.authorization;
    if (!auth) return res.json({ "success": "false", "error": "Authorization header not found." });
    let count = req.body.count ? req.body.count : req.body.server_count;

    if (!count) return res.json({ "success": "false", "error": "Count not found in body." });
    count = parseInt(count);
    if (!count) return res.json({ "success": "false", "error": "Count not integer." });
    let bot = JSON.parse(CLIENT.settings.get('bots')).find(u => u.id === botId);
    if (!bot) return res.json({ "success": "false", "error": "Bot not found." });
    if (!bot.auth) return res.json({ "success": "false", "error": "Create a bot authorization token." });
    if (bot.auth !== auth) return res.json({ "success": "false", "error": "Incorrect authorization token." });
    bot.servers = count;

    let updated = JSON.parse(CLIENT.settings.get('bots'));
    updated.find(u => u.id === botId).servers = count;
    CLIENT.settings.update("bots", JSON.stringify(updated));

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
        unirest.get(`https://discordapp.com/api/users/${id}`).headers({ 'Authorization': `Bot ${process.env.DISCORD_TOKEN}` }).end(function(user) {
            if (user["raw_body"].error) return resolve(false)
            data.push(JSON.parse(user["raw_body"]));
            resolve(data)
        });
    })
}

let members = (token) => {
    return new Promise(function(resolve, reject) {
        if (!token) resolve(false)
        unirest.get("https://discordapp.com/api/users/@me").headers({ 'Authorization': `Bearer ${token}` }).end(function(user) {
            if (user["raw_body"].error) return false
            let find = JSON.parse(user["raw_body"]).id;
            CLIENT.guilds.get(process.env.GUILD_ID).members.fetch().then(ans => {
                let people = ans.map(p => p.id);
                people.includes(find)
                if (people.includes(find)) resolve(true)
                else resolve(false)
            });
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

app.get('/api/get', async(req, res) => {
    let r = await get(req.query.token);
    res.send(r)
});

app.get('/api/get/bot/', async(req, res) => {
    let r = await getBot(req.query.id)
    res.send(r)
});


app.get('/api/bot', (req, res) => {
    res.send({ "success": "false", "error": "Bot id not provided" })
});

app.get('/api/bot/:id', (req, res) => {
    let bot = JSON.parse(CLIENT.settings.get('bots')).find(u => u.id === req.params.id);
    if (!bot) return res.send({ "success": "false", "error": "Bot not found" })
    delete bot.auth;
    bot.success = "true";
    res.send(bot);
});

app.get('/api/members', async(req, res) => {
    let r = await members(req.query.token);
    res.send(r)
});


/* web stuff above this */
const { Client, Schema } = require('klasa');

Client.defaultPermissionLevels
    .add(8, ({ client, author }) => process.env.ADMIN_USERS.split(' ').includes(author.id));

const CLIENT = new Client({
    commandEditing: true,
    prefix: process.env.PREFIX,
    providers: {
        default: "mongodb"
    },
    gateways: {
        users: {
            schema: new Schema()
                .add('bio', 'string')
        },
        client: {
            schema: Client.defaultClientSchema
                .add('bots', 'string', { default: "[]" })
        }
    }
});

CLIENT.on('eventError', e => { throw new Error(e); });
CLIENT.on('commandError', e => { throw new Error(e); });
CLIENT.on('finalizerError', e => { throw new Error(e); });
CLIENT.on('monitorError', e => { throw new Error(e); });
CLIENT.on('taskError', e => { throw new Error(e); });
CLIENT.on('guildMemberAdd', member => {
    if (member.user.bot) {
        member.roles.add(member.guild.roles.get(process.env.BOT_ROLE_ID)); // Bot role
        member.roles.add(member.guild.roles.get(process.env.UNVERIFIED_ROLE_ID)); // Unverified role
    }
})

CLIENT.login(process.env.DISCORD_TOKEN);
