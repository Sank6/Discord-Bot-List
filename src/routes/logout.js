const { Router } = require("express");

const route = Router();

route.get("/", async (req, res) => {
  req.logout();
  res.redirect(`/`);
});

module.exports = route;
