const { Router } = require("express");

const submit = require("@routes/api/bots/submit");
const list = require("@routes/api/bots/list");
const modify = require("@routes/api/bots/modify");
const search = require("@routes/api/bots/search");

const route = Router();

route.use("/submit", submit);
route.use("/list", list);
route.use("/search", search);
route.use("/modify", modify);

module.exports = route;
