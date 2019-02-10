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


// Grabs all scraped articles from the db
router.get("/", function(req, res) {

  db.Article.find({ isSaved: false })
    .then(function(dbArt) {
      console.log(dbArt);
      res.render("index", { ArtObj: dbArt });
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Grabs all saved articles from the db
router.get("/saved", function(req, res) {

  db.Article.find({ isSaved: true })
    .then(function(dbArt) {
      console.log(dbArt);
      res.render("saved", { saved: dbArt });
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Change article to a saved article
router.post("/saveArticle/:id", function(req, res) {

  db.Article.update(
    { _id: req.params.id },
    {
      $set: {
        isSaved: true
      }
    }
  )
    .then(function(result) {
      console.log(result);
      res.json(result);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Remove article from saved articles
router.post("/deleteArticle/:id", function(req, res) {

  db.Article.update(
    { _id: req.params.id },
    {
      $set: {
        isSaved: false
      }
    }
  )
    .then(function(result) {
      console.log(result);
      res.json(result);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Grabs a specific Article by id, and populates this id with it's corresponding note
router.get("/articles/:id", function(req, res) {

  db.Article.findOne({ _id: req.params.id })
    .populate("Note")
    .then(function(dbArt) {
      console.log("populating note.....");
      console.log(dbArt);
      console.log("--------------------------------");
      res.json(dbArt);
    })
    .catch(function(err) {
      res.json(err);
    });
})

// Saves and updates an Article's corresponding Note
router.post("/articles/:id", function(req, res) {
  console.log("this is req.body......")
  console.log(req.body);
  console.log("--------------------------------");
  db.Note.create(req.body)
    .then(function(dbNote) {
      console.log("dbNote.............")
      console.log(dbNote);
      console.log("--------------------------------");
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    });
});

// deletes all articles from the Article document.
router.get("/delete", function(req, res) {

  db.Article.remove({})
    .then(function() {
      var deleteMessage = "Looks like there are no articles. Hit 'Scrape New Articles!' to get new articles.";
      res.render("index", { deleteMessage })
    })
    .catch(function(err) {
      res.json(err);
    });
});


module.exports = router;