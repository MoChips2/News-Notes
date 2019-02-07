//Dependencies
var express = require("express");
var path = require("path");
var exphbs = require("express-handlebars");
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

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

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
          res.redirect("/");
        })
        .catch(function(err) {
          console.log(err);
        });
    });
  });
});

// Grabs all articles from the db
app.get("/", function(req, res) {

  db.Article.find({})
    .then(function(dbArt) {
      res.render("index", {ArtObj: dbArt});
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

// Saves and updates an Article's corresponding Note
app.post("/articles/:id", function(req, res) {

  db.Note.create(req.body)
  .then(function(dbNote) {
   console.log(dbNote);
  });
});

app.get("/delete", function(req, res) {
  
  db.Article.remove({})
  .then(function() {
    var deleteMessage = "Looks like there are no articles. Hit 'Scrape New Articles!' to get new articles.";
    res.render("index", {deleteMessage})
  //  res.send("Looks like there are no articles. Hit 'Scrape New Articles!' to get new articles.")
  })
  .catch(function(err) {
    res.json(err);
  })
})

app.get("/", function(req, res) {
  res.render(path.join(__dirname, "./views/index.handlebars"));
})

app.listen(PORT, function() {
  console.log("App now listening at localhost:" + PORT);
});