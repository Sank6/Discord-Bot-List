const { Router } = require("express");
const { Canvas } = require("canvas-constructor");
const fetch = require("node-fetch");
const Bots = require("@models/bots");

const { GUILD_ID } = process.env;

const route = Router();

route.get("/:id", async (req, res, next) => {
  const bot = await Bots.findOne({ botid: req.params.id }, { _id: false })
  if (!bot) return res.sendStatus(404);
  try {
    let owner = await req.app.get("client").guilds.cache.get(GUILD_ID).members.fetch(bot.owners[0]);
    let lg = decodeURIComponent(bot.logo.replace("/avatar/?avatar=", "")).replace("webp", "png?size=512");
    let avatar = await fetch(lg).then(res => res.buffer());

    let img = new Canvas(500, 200)
      .setColor("#ffffff")
      .addRect(0, 0, 500, 200)
      .setColor("#888888")
      .addBeveledRect(39, 29, 422, 52, 2)
      .setColor("#ffffff")
      .addBeveledRect(40, 30, 420, 50, 2)
      .setColor("#888888")
      .setTextAlign("center")
      .setTextSize(35)
      .addText(bot.username, 250, 67)
      .addCircularImage(avatar, 80, 135, 40, 40, 5, true)
      .setTextAlign("left")
      .setTextSize(12);
    if (bot.servers[bot.servers.length-1]) img.addText(`${bot.servers[bot.servers.length-1].servers} servers`, 140, 105);
    img
      .addText(`Prefix: ${bot.prefix}`, 140, 125)
      .setTextSize(11)
      .addMultilineText(bot.description, 140, 145, 320, 15)

      .setTextSize(10)
      .setTextAlign("right")
      .addText(process.env.DOMAIN, 490, 195)
      .setTextAlign("left")
      .addText(owner.user.tag, 10, 195);

    res.writeHead(200, {
      "Content-Type": "image/png"
    });
    res.end(await img.toBuffer(), "binary");
  } catch (e) {
    console.error(e)
    res.sendStatus(404);
  }
});

module.exports = route;
