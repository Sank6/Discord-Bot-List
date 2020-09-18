const { getBot } = require('@utils/discordApi');
const is = require('is-html');

const { server: {id}, bot_options: {max_owners_count} } = require("@root/config.json");

module.exports = async (req, b=null) => {
    let data = req.body;
    if (data.description.length > 120) return {success: false, message: "Your summary is too long."};
    
    let memberCheck = req.app.get('client').guilds.cache.get(id).member(req.user.id);

    let [bot] = await getBot(req.params.id);
    if (memberCheck == null)
        return {success: false, message: "You aren't in the server", button: {text: "Join", url: "/join"}}
    if (bot.user_id && bot.user_id[0].endsWith("is not snowflake."))
        return {success: false, message: "Invalid bot id"}
    if (bot.message == "Unknown User" || bot.bot !== true)
        return {success: false, message: "Invalid bot id"}
    if (is(data.description))
        return {success: false, message: "HTML is not supported in your bot summary"}
    if (!data.long.length || !data.description.length || !data.prefix.length)
        return {success: false, message: "Invalid submission. Check you filled all the fields."}

    if (b && !b.owners.includes(req.user.id) && !server.admin_user_ids.includes(req.user.id))
        return {success: false, message: "Invalid request. Please sign in again.", button: {text: "Logout", url: "/logout"}}

    if (b && data.owners.replace(',', '').split(' ').remove('').join() !== b.owners.join() && b.owners[0] !== req.user.id)
        return {success: false, message: "Only the primary owner can edit additional owners"};

    let users = [req.user.id];
    users = users.concat(data.owners.replace(',', '').split(' ').remove(''));
    users = users.filter(id => /[0-9]{16,20}/g.test(id))

    try {
        users = await req.app.get('client').guilds.cache.get(id).members.fetch({user: users});
        users = [...new Set(users.map(x => { return x.user }).filter(user => !user.bot).map(u => u.id))];

        if (users.length > max_owners_count)
            return {success: false, message: `You can only add up to ${max_owners_count - 1} additional owners`};

        return {success: true, bot, users}
    } catch(e) {
        return {success: false, message: "Invalid Owner IDs"};
    }
}