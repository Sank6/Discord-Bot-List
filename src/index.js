require("module-alias/register");
const mongoose = require("mongoose");

const colors = require('colors');
const bot = require('./bot/index');
const App = require('./structures/app.js');
const { web: {port}, discord_client: {token}, mongo_url } = require("../config.json");


(async () => {
    await mongoose.connect(`${mongo_url}`, {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      retryWrites: true
    });
    console.log(colors.yellow(`Connected to the database on `) + colors.underline.green(mongo_url));
    let client = await bot.init(token);
    console.log(colors.yellow(`Logged in as `) + colors.underline.green(client.user.tag));
    await new App(client).listen(port || 8080);
    console.log(colors.yellow(`Running on port `) + colors.underline.green(port || 8080));
})()
