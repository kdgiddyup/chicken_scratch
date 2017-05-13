var express = require("express");
var methodOverride = require("method-override");
var bodyParser = require("body-parser");
var exphbs = require("express-handlebars");

// for aws storage, require the aws sdk
var AWS = require('aws-sdk');
var s3 = new AWS.S3();



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

db.sequelize.sync({force: true}).then(function() {
   app.listen(PORT, function() {
     console.log("App listening on PORT " + PORT);
   });
});