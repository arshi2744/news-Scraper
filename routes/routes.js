var express = require("express");
var db = require("../models");
var request = require("request");
var cheerio = require("cheerio");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

var router = express.Router();
// Use body-parser for handling form submissions
router.use(bodyParser.urlencoded({ extended: true }));

router.get("/scrape", (req, res) => {
    console.log("scraping");
    // First, we grab the body of the html with request
    db.Article.remove({}).then((err, data) => { if(err) throw err; console.log("cleared"); });
    db.Comment.remove({}).then((err, data) => { if(err) throw err; console.log("comments collection cleared"); });

    request.get("https://lightboxfilmcenter.org/programs/", function(error, response, html) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(html);
  
      // Now, we grab every h2 within an article tag, and do the following:
      $("article.c-article").each(function(i, element) {
        // Save an empty result object
        var result = {};
  
        // Add the text and href of every link, and save them as properties of the result object
        result.headline = $(this)
          .find("h2.o-title--secondary")
          .text();
        result.summary = $(this)
          .find("p.o-heading")
          .text();
          result.url = $(this)
          .find("a.c-link--navigate-primary")
          .attr("href");
  
        db.Article.create(result)
          .then(function(dbArticle) {
            // View the added result in the console
            console.log(dbArticle);
          })
          .catch(function(err) {
            // If an error occurred, send it to the client
            return res.json(err);
          });
      });
  
      // If we were able to successfully scrape and save an Article, send a message to the client
      res.send("Scrape Complete");
    });
  });

router.get("/", (req, res) => {
  db.Article.find({})
  .populate("comment")
  .then(result => {
    console.log(result)
    res.render("index", {article: result});
  });
});

router.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  console.log('notes function called')  
  // console.log(req.params.id)
  // console.log(req.body)
  db.Comment.create(req.body)
    .then(function(dbComment) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, {$push: {comment: dbComment._id, body: "comment"}}, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

router.delete("/comment/:id", function(req, res) {
  db.Comment.deleteOne(
      {_id: req.params.id}
    ).then(function(result){
      console.log(req.params.id)
      ///below doesn't work and I can't figure it out.
      return db.Article.find(
        {"comment": 
          {"$elemMatch": 
            {"_id": mongoose.Types.ObjectId(req.params.id)} 
          }
        }
      ).then(function(updateResult){
      console.log("update result");
      console.log(updateResult);
      res.json(updateResult);
    })});
});

module.exports = router;