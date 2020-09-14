const Bots = require("@models/bots");

module.exports = async () => {
    const bots = await Bots.find({"state": {$ne: "deleted"}}, { _id: false, auth: false, __v: false, addedAt: false })
    return bots.map(x => {
        if (x.servers && x.servers[x.servers.length - 1])
            x.servers = x.servers[x.servers.length - 1].count;
        else x.servers = null
        return x
    })
};
