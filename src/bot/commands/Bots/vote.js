const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const Bots = require("@models/bots");
const Users = require("@models/users")
const { server } = require("@root/config.json")

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            usage: "[User:user]"
        });
    }
    async run(message, [user]) {
        if (!user || !user.bot) return message.channel.send(`Ping a **bot** to vote.`);
        if (user.id === message.client.user.id) return message.channel.send(`-_- No`);
        let users = await Users.findOne({ userid: message.author.id }, { _id: false })
        const bot = await Bots.findOne({ botid: user.id }, { _id: false })
        if (users) {
            //console.log(users.date)
            var dt = new Date(users.date)
            dt.setHours(dt.getHours() + 12);
            var countDownDate = dt.getTime();
            var now = new Date().getTime();
            var distance = countDownDate - now;
            var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            var seconds = Math.floor((distance % (1000 * 60)) / 1000);
            let vote
            if (!bot.vote) {
                vote = 1
            } else {
                vote = bot.vote + 1
            }
            let date = new Date()
            if (distance < 0) {
                await Bots.updateOne({ botid: user.id }, { $set: { vote } })
                const users = await Users.findOne({ userid: message.author.id }, { _id: false })
                if (!users) {
                    new Users({
                        userid: message.author.id,
                        date: new Date()
                    }).save()
                } else {
                    await Users.updateOne({ userid: message.author.id }, { $set: { date } });
                }
                let embed = new MessageEmbed()
                    .setColor('BLUE')
                    .setDescription(`You have successfully voted for ${user}`)
                    .setFooter(`You can vote again after 12 hours.`)
                message.channel.send(embed)
                const e = new MessageEmbed()
                    .setTitle('Vote Count Updated! 🎉')
                    .setColor('BLUE')
                    .setDescription(`The vote count for ${user} has been updated.`)
                    .addField(`Voter`, `${message.author} (${message.author.tag})`, false)
                    .addField(`Vote Count`, `${vote} Votes`, false)
                    .addField(`Bot Page`, `[Here](https://discordbotdirectory.net/bots/${user.id})`, false)
                    .setTimestamp();
                //const channel = await message.guild.channels.cache.get(server.vote_log);
                const channel = await message.guild.channels.cache.get(server.vote_log);
                const webhooks = await channel.fetchWebhooks();
                const webhook = webhooks.first();
                await webhook.send({
                    embeds: [e],
                });
            } else {
                let embed = new MessageEmbed()
                    .setColor('RED')
                    .setDescription(`You can only vote again after ${hours} Hours ${minutes} Minutes ${seconds} Seconds !`)
                message.channel.send(embed)
            }
        } else {
            let vote
            if (!bot.vote) {
                vote = 1
            } else {
                vote = bot.vote + 1
            }
            await Bots.updateOne({ botid: user.id }, { $set: { vote } })
            new Users({
                userid: message.author.id,
                date: new Date()
            }).save()
            let embed = new MessageEmbed()
                .setColor('BLUE')
                .setDescription(`You have successfully voted for ${user}`)
                .setFooter(`You can vote again after 12 hours.`)
            message.channel.send(embed)
            const e = new MessageEmbed()
                .setTitle('Vote Count Updated! 🎉')
                .setColor('BLUE')
                .setDescription(`The vote count for ${user} has been updated.`)
                .addField(`Voter`, `${message.author} (${message.author.tag})`, false)
                .addField(`Vote Count`, `${vote} Votes`, false)
                .addField(`Bot Page`, `[Here](https://discordbotdirectory.net/bots/${user.id})`, false)
                .setTimestamp();
            //const channel = await message.guild.channels.cache.get(server.vote_log);
            const channel = await message.guild.channels.cache.get(server.vote_log);
            const webhooks = await channel.fetchWebhooks();
            const webhook = webhooks.first();
            await webhook.send({
                embeds: [e],
            });
        }
    }
}
