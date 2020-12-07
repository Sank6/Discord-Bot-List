const { Router } = require("express");
const { auth } = require("@utils/discordApi");
const Bots = require("@models/bots");
const { MessageEmbed } = require('discord.js');
const { server } = require("@root/config.json")
const route = Router();

route.patch("/:id", auth, async function (req, res) {
    let data = req.body;
    const bot = await Bots.findOne({ "state": "unverified", botid: req.params.id }, { _id: false });
    if (!bot) return res.json({ success: false, message: 'Bot not found' })
    let modLog = await req.app.get('client').channels.cache.get(server.mod_log_id);
    let mod = await req.app.get('client').users.cache.get(req.user.id);
    let message = await req.app.get('client').guilds.cache.get(server.id);
    let botUser = await req.app.get('client').users.cache.get(req.params.id);
    const staffcheck = await req.app.get('client').guilds.cache.get(server.id).members.cache.get(req.user.id).roles.cache.has(server.role_ids.bot_verifier);
    if (!server.admin_user_ids.includes(req.user.id) && !staffcheck)
        return res.json({ success: false, message: 'Invalid User' });
    if (data.method === 'approve') {
        await Bots.updateOne({ botid: req.params.id }, { $set: { state: "verified", logo: req.app.get('client').users.cache.get(req.params.id).displayAvatarURL({ format: "png", size: 256 }) } });
        let owners = [bot.owners.primary].concat(bot.owners.additional);
        let e = new MessageEmbed()
            .setTitle('Bot Verified')
            .addField(`Bot`, `<@${bot.botid}>`, true)
            .addField(`Owner(s)`, owners.map(x => x ? `<@${x}>` : ""), true)
            .addField("Mod", mod, true)
            .setThumbnail(botUser.displayAvatarURL({ format: "png", size: 256 }))
            .setTimestamp()
            .setColor(0x26ff00);
        modLog.send(e);
        modLog.send(owners.map(x => x ? `<@${x}>` : "")).then(m => { m.delete(); });

        owners = await message.members.fetch({ user: owners });
        owners.forEach(o => {
            o.roles.add(message.roles.cache.get(server.role_ids.bot_developer));
            o.send(`Your bot \`${bot.username}\` has been verified.`);
        });
        message.members.fetch(message.client.users.cache.find(u => u.id === bot.botid)).then(bot => {
            bot.roles.set([server.role_ids.bot, server.role_ids.verified]);
        });
        return res.json({ success: true })

    } else if (data.method === 'deny') {
        await Bots.updateOne({ botid: req.params.id }, { $set: { state: "deleted", logo: req.app.get('client').users.cache.get(req.params.id).displayAvatarURL({ format: "png", size: 256 }) } });
        let owners = [bot.owners.primary].concat(bot.owners.additional)
        e = new MessageEmbed()
            .setTitle('Bot Removed')
            .addField(`Bot`, `<@${bot.botid}>`, true)
            .addField(`Owner`, owners.map(x => x ? `<@${x}>` : ""), true)
            .addField("Mod", mod, true)
            .addField("Reason", data.reason)
            .setThumbnail(botUser.displayAvatarURL({ format: "png", size: 256 }))
            .setTimestamp()
            .setColor(0xffaa00)
        modLog.send(e)
        modLog.send(owners.map(x => x ? `<@${x}>` : "")).then(m => { m.delete() });
        owners = await message.members.fetch({ user: owners })
        owners.forEach(o => {
            o.send(`Your bot ${bot.username} has been removed:\n>>> ${data.reason}`)
        })
        if (!message.client.users.cache.find(u => u.id === bot.botid).bot) return;
        try {
            message.members.fetch(message.client.users.cache.find(u => u.id === bot.botid))
                .then(bot => {
                    bot.kick().then(() => { })
                        .catch(e => { console.log(e) })
                }).catch(e => { console.log(e) });
        } catch (e) { console.log(e) }
        return res.json({ success: true })
    } else {
        return res.json({ success: false, message: 'Invalid Method' });
    }
});

module.exports = route;
