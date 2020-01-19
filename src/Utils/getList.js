module.exports = (client) => {
    let ans = JSON.parse(client.settings.get('bots')).filter(x => x.state != "deleted")
    ans.forEach(b => { delete b.auth })
    return ans
};
