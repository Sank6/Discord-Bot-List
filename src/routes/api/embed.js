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

    let img = new Canvas(500, 200)
      .setColor("#ffffff")
      .printRectangle(0, 0, 500, 200)
      .setColor("#888888")
      .printRoundedRectangle(39, 29, 422, 52, 2)
      .setColor("#ffffff")
      .printRoundedRectangle(40, 30, 420, 50, 2)
      .setColor("#888888")
      .setTextAlign("center")
      .setTextSize(35)
      .printText(bot.username, 250, 67)
      .printCircularImage(avatar, 80, 135, 40, 40, 5, true)
      .setTextAlign("left")
      .setTextSize(12);
    if (bot.servers[bot.servers.length-1]) img.printText(`${bot.servers[bot.servers.length-1].count} servers`, 140, 105);
    img
      .printText(`Prefix: ${bot.prefix}`, 140, 125)
      .setTextSize(11)
      .printWrappedText(bot.description, 140, 145, 320, 15)

      .setTextSize(10)
      .setTextAlign("right")
      .printText(domain_with_protocol, 490, 195)
      .setTextAlign("left")
      .printText(owner.user.tag, 10, 195);

    res.writeHead(200, {
      "Content-Type": "image/png"
    });
    res.end(await img.toBuffer(), "binary");
  } catch (e) {
    res.sendStatus(500);
  }
});

module.exports = route;
