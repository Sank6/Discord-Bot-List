const bodyParser = require("body-parser");
const url = require('is-url');
const { Router } = require("express");
const showdown = require('showdown');

const resubmit = require("@routes/bots/resubmit");
const search = require("@routes/bots/search");
const edit = require("@routes/bots/edit");

const route = Router();
const converter = new showdown.Converter();
converter.setOption('tables', 'true');

route.use("/resubmit", resubmit);
route.use("/search", search);
route.use("/edit", edit);

route.get('/:id', async (req, res, next) => {
    let response = JSON.parse(req.app.get('client').settings.get('bots')).find(u => u.id === req.params.id);
    if (!response) return next();
    if (response.state === "deleted") return res.sendStatus(404);
    if (!response) return res.sendStatus(404);
    let person
    try {
        person = await req.app.get('client').guilds.cache.get(process.env.GUILD_ID).members.fetch(response.owners[0]);
    } catch (e) {
        person = {
            user: {
                "tag": "Unknown User"
            }
        }
    }
    let b = "#8c8c8c";
    try {
        let c = await req.app.get('client').users.cache.find(u => u.id === response.id)
        if (c) c = c.presence.status;
        else c = "offline";
        switch (c) {
            case "online":
                b = "#32ff00"
                break;
            case "idle":
                b = "#ffaa00";
                break;
            case "dnd":
                b = "#ff0000";
                break;
            case "offline":
            default:
                b = "#8c8c8c"
                break;
        }
    } catch (e) {
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
})

module.exports = route;
