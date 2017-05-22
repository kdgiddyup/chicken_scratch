//pass contribution ID to art upload form on click
$(".submitArt").on("click",function(event){
    event.preventDefault();
    $("#artUploadForm").attr("action","/api/new/art/");
    // pass the contribution id from the art button to the form's hidden contributionId input 
    $("#ContributionId").attr("value",$(this).attr("data-contribution-id"));
    // ajax post to our art route
    $.post("/api/new/art/", function(data){
        $("#fileupload").val("");                
    });
});

 // loop through each contribution's metadata div and ajax in the username associated with its data-contributor-id
$(document).ready(function(){

    var userIds = $(".metadata");
    $(userIds).each(function(index){
        $.get("/api/contributor/"+$(this).attr("data-id"), function(results){
            $(".metadata").eq(index).html(results.name);
        })
    });

    // loop through each contribution and ajax in any artwork associated with it
    var contributions = $(".contribution");
    $(contributions).each(function(index){
        $.get("/api/art/"+$(this).attr("data-contribution"), function(results){
            console.log(results);
            if (results.url)
                $(".contribution").eq(index).prepend("<img class=\"contribArt\" src=\""+results.url+"\"/>").children("button").remove();
    })
    });

    // update cover art if there is some stored in table
        // ajax to get existing cover art urls
        console.log("STORY ID",$("#storyContainer").attr("data-story-id"));
    $.get("/api/coverart/"+$("#storyContainer").attr("data-story-id"), function(images){
        // if there are urls in results, split them into an array
        
        if (images){
            // convert image urls from table into an array
            var coverURLs = images.split(",");
            console.log("coverURLs",coverURLs);
            // update cover art upload form with index of next art upload
            $("#coverartUploadForm").attr("action","/api/new/cover/"+coverURLs.length);
            $(".coverart").attr("data-cover-index",coverURLs.length);   
            if (coverURLs.length > 0) {
                // change coverart img tag src to most recent url from stories DB (will always be the last in the array)
            $(".coverart").attr("src",coverURLs[coverURLs.length-1]);
            };
        // update cover art upload action with new cover index based on length of cover image array
        $("#coverartUploadForm").attr("action","/api/new/cover/"+coverURLs.length);           
    }
    else {
        // update cover art upload action
        $("#coverartUploadForm").attr("action","/api/new/cover/1");
    };
        //add image data to form
        var imageInput = $("<input>").attr({"type":"hidden","name":"images","value":images});
        $("#coverartUploadForm").children().eq(0).append(imageInput);

    });

});//end doc ready