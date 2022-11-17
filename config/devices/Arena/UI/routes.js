var fs = require("fs"),
path = require("path"),
config = require("../Arena-INF-0.1.json");

function routes(opts) {
    opts.app.get("/devices/Arena/config", function (req, res, next) {
        opts.ejs.renderFile(__dirname + "/views/config.html", {
			config : config
		}, {}, function (err, str) {
            res.send(str).end();
        });
    });
    opts.app.post("/devices/Arena/config", function (req, res) {
		console.log(req.body);
		config = req.body;
		fs.writeFile( path.join(__dirname, "..", "Arena-INF-0.1.json"),
			JSON.stringify(config),
			()=>{
				res.end();
			}
		);
	});
};

module.exports = routes;
