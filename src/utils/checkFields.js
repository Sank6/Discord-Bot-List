const { getBot } = require('@utils/discordApi');
const is = require('is-html');

const { server } = require("@root/config.json");

module.exports = async (req, b=null) => {
    let data = req.body;
    if (data.description.length > 120) return {success: false, message: "Your summary is too long."};
    
    let memberCheck = req.app.get('client').guilds.cache.get(server.id).member(req.user.id);

    let [bot] = await getBot(req.params.id);
    if (memberCheck == null)
        return {success: false, message: "You aren't in the server", button: {text: "Join", url: "/join"}}
    if (bot.user_id && bot.user_id[0].endsWith("is not snowflake."))
        return {success: false, message: "Invalid bot id"}
    if (bot.message == "Unknown User" || bot.bot !== true)
        return{success: false, message: "Invalid bot id"}
    if (is(data.description))
        return {success: false, message: "HTML is not supported in your bot summary"}
    if (!data.long.length || !data.description.length || !data.prefix.length)
        return {success: false, message: "Invalid submission. Check you filled all the fields."}

    if (b && !b.owners.includes(req.user.id) && !server.admin_user_ids.includes(req.user.id))
        return {success: false, message: "Invalid request. Please sign in again.", button: {text: "Logout", url: "/logout"}}
    return {success: true}
}