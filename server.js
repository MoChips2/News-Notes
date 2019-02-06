//Dependencies
var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");

var PORT = process.env.PORT || 3000;

var app = express();

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/NewsNotes";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true })

// Routes

// Scrapes all news articles from Washington Post homepage
app.get("/scrape", function(req, res) {

  axios.get("https://www.washingtonpost.com/").then(function(response) {

    var $ = cheerio.load(response.data);

    $(".headline").each(function(i, element) {

      var result = {};

      result.headline = $(element).children("a").text();
      result.summary = $(element).parent(".no-skin").children(".blurb").text();
      result.link = $(element).children("a").attr("href");

      console.log(result);

      db.Article.create(result)
        .then(function(dbArt) {
          console.log(dbArt);
        })
        .catch(function(err) {
          console.log(err);
        });
    });

    res.send("Scrape is Complete!")
  });
});

// Grabs all articles from the db
app.get("/articles", function(req, res) {

  db.Article.find({})
    .then(function(dbArt) {
      res.json(dbArt);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Grabs a specific Article by id, and populates this id with it's corresponding note
app.get("/articles/:id", function(req, res) {

  db.Article.findOne({ _id: req.params.id})
    .populate("note")
    .then(function(dbArt) {
      res.json(dbArt);
    })
    .catch(function(err) {
      res.json(err);
    });
})

app.listen(PORT, function() {
  console.log("App now listening at localhost:" + PORT);
});