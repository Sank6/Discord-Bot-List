const { Router } = require("express");
const { Canvas } = require("canvas-constructor");
const fetch = require("node-fetch");

const route = Router();

route.get("/:id", async (req, res, next) => {
  let resp = JSON.parse(req.app.get("client").settings.get("bots")).find(
    u => u.id === req.params.id
  );

  if (!resp) return res.sendStatus(404);
  try {
    let owner = await req.app
      .get("client")
      .guilds.first()
      .members.fetch(resp.owners[0]);
    let lg = decodeURIComponent(
      resp.logo.replace("/avatar/?avatar=", "")
    ).replace("webp", "png?size=512");
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
      .addText(resp.name, 250, 67)
      .addCircularImage(avatar, 80, 135, 40, 40, 5, true)
      .setTextAlign("left")
      .setTextSize(12);
    if (resp.servers) img.addText(`${resp.servers} servers`, 140, 105);
    img
      .addText(`Prefix: ${resp.prefix}`, 140, 125)
      .setTextSize(11)
      .addMultilineText(resp.description, 140, 145, 320, 15)

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
    res.sendStatus(404);
  }
});

module.exports = route;
