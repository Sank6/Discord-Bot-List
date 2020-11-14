const { Router } = require("express");
const { auth } = require("@utils/discordApi");
const Bots = require("@models/bots");
const Users = require("@models/users");
const { server, web } = require("@root/config.json")
const Discord = require("discord.js");

const opts = {
  allowedTags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
    'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'hr', 'br',
    'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'img', 's', 'u'],
  disallowedTagsMode: 'discard',
  allowedAttributes: {
    a: ['href'],
    img: ['src']
  },
  allowedSchemes: ['https']
}

const route = Router();

route.patch("/:id", auth, async (req, res) => {
  let vote = 1
  let date = new Date();
  await Bots.updateOne({ botid: req.params.id }, { $inc: { vote } })
  const users = await Users.findOne({ userid: req.user.id }, { _id: false })
  if (!users) {
    new Users({
      userid: user.id,
      date: new Date()
    }).save()
  } else {
    await Users.updateOne({ userid: req.user.id }, { $set: { date } });
  }
  let userProfile = await req.app.get('client').users.fetch(user.id);
  const embed = new Discord.MessageEmbed()
    .setTitle('Vote Count Updated! 🎉')
    .setColor('BLUE')
    .setDescription(`The vote count for <@${req.params.id}> has been updated.`)
    .addField(`Voter`, `<@${user.id}> (${userProfile.tag})`, false)
    .addField(`Vote Count`, `${vote} Votes`, false)
    .addField(`Bot Page`, `[Here](${web.domain_with_protocol}/bots/${req.params.id})`)
    .setTimestamp();
  const channel = await req.app.get('client').channels.cache.get(server.vote_log);
  const webhooks = await channel.fetchWebhooks();
  const webhook = webhooks.first();
  await webhook.send({
    embeds: [embed],
  });
  return res.json({ success: true })
});

module.exports = route;
