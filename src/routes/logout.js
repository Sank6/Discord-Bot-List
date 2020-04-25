const { Router } = require("express");

const route = Router();

route.get("/", async (req, res, next) => {
  res.clearCookie("token");
  res.clearCookie("theme");
  res.clearCookie("username");
  res.clearCookie("avatar");
  res.clearCookie("userid");
  res.clearCookie("discriminator");
  res.redirect(`/`);
});

module.exports = route;
