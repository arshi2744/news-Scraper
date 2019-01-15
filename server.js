var express = require("express");
var exphbs = require("express-handlebars")
var bodyParser = require("body-parser");
var mongoose = require("mongoose");


var connection = require("./config/connection.js")

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

var routes = require("./routes/routes.js");
app.use(routes);
// Configure middleware

// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });