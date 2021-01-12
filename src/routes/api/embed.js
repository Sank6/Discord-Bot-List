const { Router } = require("express");
const { Canvas, resolveImage } = require("canvas-constructor");
const Bots = require("@models/bots");

const { web: {domain_with_protocol}, server: {id} } = require("@root/config.json");

const route = Router();

route.get("/:id", async (req, res) => {
  const bot = await Bots.findOne({ botid: req.params.id }, { _id: false })
  if (!bot) return res.sendStatus(404);
  try {
    let owner = await req.app.get("client").guilds.cache.get(id).members.fetch(bot.owners.primary);
    let lg = decodeURIComponent(bot.logo.replace("/avatar/?avatar=", ""))
    let avatar = await resolveImage(lg);

    let img = new Canvas(500, 250)
      .setColor("#404E5C")
      .printRectangle(0, 0, 500, 250)
      .setColor("#DCE2F9")
      .setTextAlign("center")
      .setTextFont('bold 35px sans')
      .printText(bot.username, 250, 67)
      .printRoundedImage(avatar, 20, 20, 70, 70, 20, true)
      .setTextAlign("left")
      .setTextFont('bold 12px Verdana')
    if (bot.servers[bot.servers.length-1]) img.printText(`${bot.servers[bot.servers.length-1].count} servers | ${bot.likes} ❤️`, 20, 125);
    img
      .printText(`Prefix: ${bot.prefix}`, 20, 145)
      .setTextFont('normal 15px Verdana')
      .printWrappedText(bot.description, 20, 175, 400, 15)
      
      .setTextFont('bold 12px sans-serif')
      .printText(owner.user.tag, 10, 245)
      .setTextAlign("right")
      .printText(domain_with_protocol, 490, 245);

    res.writeHead(200, {
      "Content-Type": "image/png"
    });
    res.end(await img.toBuffer(), "binary");
  } catch (e) {
    res.sendStatus(500);
  }
});

module.exports = route;
