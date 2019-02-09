var express = require("express");
var router = express.Router();

var axios = require("axios");
var cheerio = require("cheerio");
var db = require("../models")
// Routes

// Scrapes all news articles from Washington Post homepage
router.get("/scrape", function(req, res) {

  axios.get("https://www.washingtonpost.com/").then(function(response) {

    var $ = cheerio.load(response.data);

    $(".headline").each(function(i, element) {

      var result = {};

      result.headline = $(element).children("a").text();
      result.summary = $(element).parent(".no-skin").children(".blurb").text();
      result.link = $(element).children("a").attr("href");

      console.log(result);

      db.Article.create(result)
        .then(function(ArtObj) {
          console.log(ArtObj);
          res.redirect("/");
        })
        .catch(function(err) {
          console.log(err);
        });
    });
  });
});

// app.get("/", function(req, res) {
//  res.render(path.join(__dirname, "./views/index.handlebars"));
// })

// Grabs all articles from the db
router.get("/", function(req, res) {

  db.Article.find({})
    .then(function(dbArt) {
      console.log(dbArt);
      res.render("index", { ArtObj: dbArt });
    })
    .catch(function(err) {
      res.json(err);
    });
});

router.get("/saved", function(req, res) {
  res.render("../views/saved.handlebars");
})

// Grabs a specific Article by id, and populates this id with it's corresponding note
router.get("/articles/:id", function(req, res) {

  db.Article.findOne({ _id: req.params.id })
    .populate("note")
    .then(function(dbArt) {
      res.render("saved", { saved: dbArt });
    })
    .catch(function(err) {
      res.json(err);
    });
})

// Saves and updates an Article's corresponding Note
router.post("/articles/:id", function(req, res) {

  db.Note.create(req.body)
    .then(function(dbNote) {
      console.log(dbNote);
    });
});

router.get("/delete", function(req, res) {

  db.Article.remove({})
    .then(function() {
      var deleteMessage = "Looks like there are no articles. Hit 'Scrape New Articles!' to get new articles.";
      res.render("index", { deleteMessage })
      //  res.send("Looks like there are no articles. Hit 'Scrape New Articles!' to get new articles.")
    })
    .catch(function(err) {
      res.json(err);
    });
});


module.exports = router;