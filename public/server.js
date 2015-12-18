var http = require("http");
var path = require("path");
var fs = require("fs");
var cancelError = "/?error=access_denied&error_description=The+user+denied+you+access";

var server = http.createServer(function (req, res) {
    var url = (req.url !== "/" && req.url !== cancelError) ? req.url : "/index.html";
    console.log(url)
    fs.readFile(`${__dirname+url}`, "utf8", function(err, data) {
        if(err) throw err;

        var type = "*/*";

        if(url.match(/.svg$/)) {
            type = "image/svg+xml";
            res.setHeader("Content-Type", type);
        }
        res.writeHead(200);
        res.end(data);
    });
});
server.listen(8181);
console.log("http://localhost:8000/");

module.exports = server;