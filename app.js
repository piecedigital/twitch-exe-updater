var express = require("express"),
  app = express(),  
	path = require("path"),
  bodyParser = require('body-parser'),
  port = process.env["PORT"] || 8182,

	fs = require("fs");

app.use(require("morgan")('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var appVersion = "0.6.3";

app.get("/", function(req, res) {
  res.send("<a href='http://piecedigital.github.io/twitch-exe'>Get Twitch Exe!</a>")
});

app.post("/check-update", function(req, res) {
  console.log(req.body)
  var operations = {
    readFS: function(filePath) {
      fs.readdir(filePath, this.handleFiles)
    },
    handleFiles: function(error, files) {
      if(error) throw error;

      var justFiles = files.filter(function(elem) {
        if(elem.match(/\.[\w]{2,4}$/)) {
          return elem;
        }
      });

      //console.log(justFiles);
      res.status(200).send({
        status: "OOD",
        files: /*["test.txt"],*/justFiles,
        newVersion: appVersion
      });
    }
  }

  if(req.body.appVersion !== appVersion) {
    operations.readFS("./public");
  } else {
    res.status(200).send({
      status: "UTD"
    });
  }
});

app.post("/get-file", function(req, res) {
  fs.readFile(`./public/${req.body.filePath}`, function(error, data) {
    if(error) throw error;

    res.status(200).send({ bufferData : data });
  });
});

app.listen(port)
console.log("listening on port " + port);

process.on('uncaughtException', function (err) {
  console.log("\n\r **Uncaught Exception event** \n\r")
  console.log(err);
});