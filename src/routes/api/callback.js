const { Router } = require("express");
const { getUser } = require("@utils/discordApi");

const route = Router();

route.get("/", async (req, res, next) => {
    if (!req.query.code) throw new Error('NoCodeProvided');
    const code = req.query.code;
    const result = await getUser({code});
    if (!result) return res.redirect('/login');
    const [{ username, discriminator, avatar, id }, {refresh_token, access_token}] = result;
    res.cookie("refresh_token", refresh_token, {httpOnly: true})
    res.cookie("access_token", access_token, {httpOnly: true})
    res.cookie("theme", "light");
    res.cookie("avatar", avatar);
    res.cookie("userid", id);
    res.cookie("username", username);
    res.cookie("discriminator", discriminator);
    res.redirect(`/`);
});

module.exports = route;
