const { Router } = require("express");

const submit = require("@routes/api/bots/submit");
const resubmit = require("@routes/api/bots/resubmit");
const list = require("@routes/api/bots/list");
const modify = require("@routes/api/bots/modify");
const search = require("@routes/api/bots/search");
const del = require("@routes/api/bots/delete");

const route = Router();

route.use("/submit", submit);
route.use("/resubmit", resubmit);
route.use("/list", list);
route.use("/search", search);
route.use("/modify", modify);
route.use("/delete", del);

module.exports = route;
