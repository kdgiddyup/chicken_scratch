var db = require("../models");

module.exports = function(app){

    //GET ALL STORIES AND BLURBS
    app.get("/", function(req, res) {
        db.Story.findAll({}).then(function(results) {
        var hbsObject = {
            stories: results
        };
        res.render("index", hbsObject);
        });
    })

    //GET ALL CONTRIBUTIONS FOR EACH STORY AND USER ASSOCIATED WITH EACH CONTRIBUTION
    app.get("/", function(req, res) {
        db.Contribution.findAll({}).then(function(results) {
        var hbsObject = {
            contributions: results
        };
        res.render("index", hbsObject);
        });
    });

    //CREATE USER
    app.post("/", function(req, res) {
      db.User.create({
        username: req.body.username,
        password: req.body.password
      }).then(function(results) {
        res.redirect("/");
      });
    });

    //CREATE CONTRIBUTION
    app.post("/", function(req, res) {
      db.Contribution.create({
        contribution_text: req.body.contribution_text
      }).then(function(results) {
        res.redirect("/");
      });
    });

    //ADD RANK
    app.put("/:id", function(req, res) {
        db.Contribution.update({
            rank: req.body.rank
        }).then(function(results) {
            res.redirect("/");
        })
    });

    //ADD RANK
    app.put("/:id", function(req, res) {
        db.Art.update({
            rank: req.body.rank
        }).then(function(results) {
            res.redirect("/");
        })
    });
};
