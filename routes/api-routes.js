var db = require("../models");

module.exports = function(app){

    //GET ALL STORIES AND BLURBS AND ART AND CONTRIBUTIONS FOR COUNT. THE USER ASSOCIATED WITH THE FIRST CONTRIBUTION.
    app.get("/", function(req, res) {
        db.Story.findAll({
            include: [db.Contribution,db.Art]
        }).then(function(results) {
        res.render("index", {stories:results});
        });
    })

    //GET ALL CONTRIBUTIONS FOR EACH STORY AND USER ASSOCIATED WITH EACH CONTRIBUTION
    app.get("/api/:id", function(req, res) {
        db.Contribution.findOne({
            where: {
                id: req.params.id
            },
            include: [db.User, db.Contribution, db.Art]
        }).then(function(data) {
            res.render("project", data);
        });
    });

    //CREATE USER
    app.post("/api/new/users", function(req, res) {
      db.User.create({
        username: req.body.username,
        password: req.body.password
      }).then(function(results) {
        res.redirect("/");
      });
    });

    //CREATE CONTRIBUTION
    app.post("/api/new/contribution", function(req, res) {
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
        });
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
