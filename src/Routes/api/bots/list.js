const { Router } = require("express");
const getList = require('@utils/getList.js')

const route = Router();

route.get("/", async (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    let ans = getList(req.app.get('client'))
    res.send(ans)
});

module.exports = route;
