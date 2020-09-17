const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");

require("@utils/passport.js");

const getFilesSync = require("@utils/fileWalk");

class App {
  constructor(client, locals = {}) {
    this.express = express();
    this.express.set("views", "src/dynamic");
    this.express.set("view engine", "pug");
    this.express.set("client", client);
    this.express.locals = locals;

    / * Middleware Functions */;
    this.express.use(cookieParser());
    this.express.use(express.static(__dirname + "/../public"));
    this.express.use(
      session({
        secret:
          "F577259F38FD820133AE0BE1FB5ED76ABFC26BAC899805AF7A4FA99D4B9580DF",
        resave: false,
        saveUninitialized: false,
      })
    );
    this.express.use(passport.initialize());
    this.express.use(passport.session());

    this.loadRoutes().loadErrorHandler();
  }

  listen(port) {
    return new Promise((resolve) => this.express.listen(port, resolve));
  }

  loadRoutes() {
    const routesPath = path.join(__dirname, "../routes");
    const routes = getFilesSync(routesPath);

    if (!routes.length) return this;

    routes.forEach((filename) => {
      const route = require(path.join(routesPath, filename));

      const routePath =
        filename === "index.js" ? "/" : `/${filename.slice(0, -3)}`;

      try {
        this.express.use(routePath, route);
      } catch (error) {
        console.error(`Error occured with the route "${filename}"\n\n${error}`);
      }
    });

    return this;
  }

  loadErrorHandler() {
    this.express.use((req, res) => {
      res.status(404);

      if (req.accepts("html")) return res.render("404");

      if (req.accepts("json"))
        return res.send({
          status: 404,
          error: "Not found",
        });

      res.type("txt").send("404 - Not found");
    });

    return this;
  }
}

module.exports = App;
