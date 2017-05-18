var db = require("../models");

module.exports = function(app){

    //GET ALL STORIES AND BLURBS AND ART AND CONTRIBUTIONS FOR COUNT. THE USER ASSOCIATED WITH THE FIRST CONTRIBUTION.
    app.get("/", function(req, res) {
        db.Story.findAll({
            include: [db.Contribution,db.Art]
        }).then(function(results) {
            res.render("index", {stories: results});
        });
    });

    //GET ALL CONTRIBUTIONS FOR EACH STORY AND USER ASSOCIATED WITH EACH CONTRIBUTION
    app.get("/story/:id", function(req, res) {
        db.Contribution.findAll({
            where: {
                StoryId: req.params.id
            },
            include: [db.Story]
        }).then(function(data) {
              console.log(data);
            res.render("story", {contributions: data});
        });
    });

    //SEARCH USER
    app.get("/", function(req, res) {
        db.User.findOne({
            where: {
                username: req.body.username,
                password: req.body.password
            }
        }).then(function(results) {
            res.render("index", {user: results})
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

    //CREATE STORY
    app.post("/api/new/story", function(req, res) {
        db.Story.create({
            title: req.body.title,
            blurb: req.body.blurb
        }).then(function(results) {
            res.redirect("/");
        });
    });

    //CREATE CONTRIBUTION
    app.post("/api/new/contribution/:id", function(req, res) {
      db.Contribution.create({
        contribution_text: req.body.contribution_text,
        UserId: req.params.id,
        StoryId: req.params.id
      }).then(function(results) {
        res.redirect("/");
      });
    });

    //ADD RANK
    // app.put("/:id", function(req, res) {
    //     db.Contribution.update({
    //         rank: req.body.rank
    //     }).then(function(results) {
    //         res.redirect("/");
    //     });
    // });

    // //ADD RANK
    // app.put("/:id", function(req, res) {
    //     db.Art.update({
    //         rank: req.body.rank
    //     }).then(function(results) {
    //         res.redirect("/");
    //     })
    //});
};

// upload art; id param here is contribution id 
    // app.put("/new/art:id", function(req,res){
    //     // upload image to AWS

            
    //         // Read in the file, convert it to base64, store to S3
    //         fs.readFile(req.body.filePath, function (err, data) {
    //         if (err) { throw err; }

    //         var base64data = new Buffer(data, 'binary');

    //         var s3 = new AWS.S3();
    //         s3.client.putObject({
    //             Bucket: process.env.S3_BUCKET,
    //             Key: req.body.filePath,
    //             Body: base64data,
    //             ACL: 'public-read'
    //         },function (resp) {
    //             console.log(arguments);
    //             console.log('Successfully uploaded package.');
    //         });

    //         });


        
    //     db.Art.update({
    //         art_file: req.body.art_file 
    //     })
    // })
