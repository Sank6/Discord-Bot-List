const { Router } = require("express");
const { getUser } = require('@utils/discordApi')

const route = Router();

route.get("/", async (req, res, next) => {
    let token = req.cookies['refresh_token']
    let [user, tk] = await getUser(token);
    res.cookie("refresh_token", tk, {httpOnly: true})
    user = await req.app.get("client").users.cache.get(user.id);
    if (!user) return res.render("user/notfound", {});

    let bots = JSON.parse(req.app.get("client").settings.get("bots")).filter(b =>
        b.owners.includes(user.id)
    );
    let data = {
        user: user,
        cards: bots
    };
    res.render("user/me", data);
});

module.exports = route;