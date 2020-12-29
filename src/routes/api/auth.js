const { Router } = require("express");

const auth = require("@routes/api/auth/index");
const reset = require("@routes/api/auth/reset");
const stats = require("@routes/api/auth/stats");
const liked = require("@routes/api/auth/liked");

const route = Router();

route.use("/", auth);
route.use("/reset", reset);
route.use("/stats", stats);
route.use("/liked", liked);

module.exports = route;
