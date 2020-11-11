const recaptcha2 = require('recaptcha2')
const is = require('is-html');

const { getBot } = require('@utils/discordApi');

const { server: {id}, bot_options: {max_owners_count}, web: {recaptcha_v2: {site_key, secret_key}} } = require("@root/config.json");

const recaptcha = new recaptcha2({
    siteKey: site_key,
    secretKey: secret_key
})

module.exports = async (req, b=null) => {
    let data = req.body;

    if (!data.recaptcha_token)
        return {success: false, message: "Invalid Captcha"}

    try {
        await recaptcha.validate(data.recaptcha_token)
    } catch (e) {
        return {success: false, message: "Invalid Captcha"}
    }

    if (data.description.length > 120) return {success: false, message: "Your summary is too long."};
    
    let memberCheck = await req.app.get('client').guilds.cache.get(id).members.fetch(req.user.id);

    let [bot] = await getBot(req.params.id);
    if (memberCheck == null) {
        return {success: false, message: "You aren't in the server", button: {text: "Join", url: "/join"}}
    }
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

    if (b && data.owners.replace(',', '').split(' ').remove('').join() !== b.owners.slice(1).join() && b.owners[0] !== req.user.id)
        return {success: false, message: "Only the primary owner can edit additional owners"};

    let primary_owner = data.owners[0]
    if (b !== null) primary_owner = b.owners[0]
    let users = [primary_owner];
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