var express = require("express");
var methodOverride = require("method-override");
var bodyParser = require("body-parser");
var exphbs = require("express-handlebars");
var fs = require('fs');

// for aws storage, require the aws sdk
var AWS = require('aws-sdk');
var s3 = new AWS.S3();

// For dev purposes only
AWS.config.update({ accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY });

var db = require("./models");

var app = express();
var PORT = process.env.NODE_ENV || 8080;



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));
app.use(methodOverride("_method"));

app.use(express.static(__dirname + "/public"));

require("./routes/api-routes.js")(app);

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

db.sequelize.sync({}).then(function() {
   app.listen(PORT, function() {
     console.log("App listening on PORT " + PORT);
   });
});