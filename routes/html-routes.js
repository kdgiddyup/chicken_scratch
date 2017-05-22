var db = require("./../models");

module.exports = function(app){
//GET ALL STORIES AND BLURBS AND ART AND CONTRIBUTIONS FOR COUNT. THE USER ASSOCIATED WITH THE FIRST CONTRIBUTION.
app.get("/", function(req, res) {
    db.Story.findAll({
        include: [db.Contribution,db.Art]
    }).then(function(results) {
        
        res.render("index", {stories: results});
    });
});

app.get("/signout", function(req, res){
    req.session.destroy();
    res.redirect("/");
});

//GET ALL CONTRIBUTIONS FOR EACH STORY AND USER ASSOCIATED WITH EACH CONTRIBUTION
app.get("/story/:id", function(req, res) {
    db.Story.findOne({
        where: {
            id: req.params.id
        },
        include: [db.Contribution]
    }).then(function(data) {

        res.render("story", {story: data});
        });
    });

}