const { Router } = require("express");
const { Canvas, resolveImage } = require("canvas-constructor");
const Bots = require("@models/bots");

const { web: {domain_with_protocol}, server: {id} } = require("@root/config.json");

const path = require("path");

const route = Router();

route.get("/:id", async (req, res) => {
  const bot = await Bots.findOne({ botid: req.params.id }, { _id: false })
  if (!bot) return res.sendStatus(404);
  try {
    let owner = await req.app.get("client").guilds.cache.get(id).members.fetch(bot.owners.primary);
    let avatar = await resolveImage(bot.logo);
    let verified = await resolveImage(path.join(__dirname, "./verified_badge.png"));

    let discord_verified = (await (await req.app.get('client').users.fetch(req.params.id)).fetchFlags()).has("VERIFIED_BOT");

    let img = new Canvas(500, 250)
      .setColor("#404E5C")
      .printRectangle(0, 0, 500, 250)
      .setColor("#DCE2F9")
      .setTextFont('bold 35px sans')
      .printText(bot.username, 120, 75)
      .printRoundedImage(avatar, 30, 30, 70, 70, 20)
      .setTextAlign("left")
      .setTextFont('bold 12px Verdana')
    if (bot.servers[bot.servers.length-1])
      img.printText(`${bot.servers[bot.servers.length-1].count} servers | ${bot.likes} ❤️`, 30, 125);
    if (discord_verified)
      img.printImage(verified, 420, 55)
    img
      .printText(`Prefix: ${bot.prefix}`, 30, 145)
      .setTextFont('normal 15px Verdana')
      .printWrappedText(bot.description, 30, 175, 440, 15)
      
      .setTextFont('bold 12px sans-serif')
      .printText(owner.user.tag, 10, 245)
      .setTextAlign("right")
      .printText(domain_with_protocol, 490, 245);

    res.writeHead(200, {
      "Content-Type": "image/png"
    });
    res.end(await img.toBuffer(), "binary");
  } catch (e) {
    throw e
    res.sendStatus(500);
  }
});

module.exports = route;
