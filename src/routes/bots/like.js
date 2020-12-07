const { Router } = require("express");
const { auth } = require('@utils/discordApi')
const Bots = require("@models/bots");
const Users = require("@models/users");

const { web: { recaptcha_v2: { site_key } } } = require("@root/config.json");

const route = Router();

route.get("/:id", auth, async (req, res) => {
    let bot = await Bots.findOne({ botid: req.params.id }, { _id: false, auth: false })
        let users = await Users.findOne({ userid: req.user.id }, { _id: false, auth: false });
        if (!bot) return res.render("404"), {req};

        res.render("like", {
            bot,
            user: req.user,
            site_key,
            users,
            req
        });
});

module.exports = route;
