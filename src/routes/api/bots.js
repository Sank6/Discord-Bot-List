const { Router } = require("express");

const submit = require("@routes/api/bots/submit");
const list = require("@routes/api/bots/list");
const modify = require("@routes/api/bots/modify");
const search = require("@routes/api/bots/search");
const del = require("@routes/api/bots/delete");

const route = Router();

route.use("/", submit);
route.use("/", modify);
route.use("/", del);

route.use("/list", list);
route.use("/search", search);

module.exports = route;
