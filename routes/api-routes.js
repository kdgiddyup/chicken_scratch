var db = require("../models");

// set up for image uploading
// multer helps with multipart files (ie, images)
var multer = require('multer');
var storage = multer.memoryStorage()
var upload = multer({ storage: storage })

var S3FS = require('s3fs');
var bucketPath = process.env.S3_BUCKET;

var s3Options = {
  region: 'us-east-1',
};
var fsImpl = new S3FS(bucketPath, s3Options);



// for aws storage, require the aws sdk
    // var AWS = require('aws-sdk');
    // var s3 = new AWS.S3();
// For dev purposes only
    // AWS.config.update({ accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY });

    // var bucket = new AWS.S3({params: {Bucket: process.env.S3_BUCKET}});




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
            include: [db.Story, db.User]
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
        UserId: req.body.userId,
        StoryId: req.params.id
      }).then(function(results) {
        res.redirect("/");
      });
    });


    // upload art; id param here is contribution id 
=======
    // upload art

    app.post("/api/new/art", upload.single('fileupload'), function (req, res, next) {
    // req.file is the `fileupload` file 
    // req.body will hold the text fields, if there were any   
       var fileName = "img-Story"+req.body.StoryId+"-Contrib"+req.body.ContributionId+"."+req.file.mimetype.split("/")[1];
       console.log(req.file);
        fsImpl.writeFile(fileName, req.file.buffer, "binary", function (err) {
            if (err) throw(err);
            db.Art.create({
                art_file: 'https://s3.amazonaws.com/chickenscratchdb/'+fileName,
                ContributionId: req.body.ContributionId,
                StoryId: req.body.StoryId
            }).then(function(results) {
                res.redirect("/story/"+req.body.StoryId)
            })    
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
}
