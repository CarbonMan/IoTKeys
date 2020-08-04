var config = require("../SF-884-INF-0.1.json");

function routes(opts) {
    var router = opts.express.Router();
    router.get("/devices/SF-884/config", function (req, res, next) {
        ejs.renderFile(__dirname + "/views/config.html", {
			config : config
		}, {}, function (err, str) {
            res.send(str).end();
        });
    });
};

module.exports = routes;
