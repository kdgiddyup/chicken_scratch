
$(document).ready(function(){
    // update cover art if there is some stored in table
        // ajax to get existing cover art urls
    $(".story_blurb_art").each(function(){
        var blurb = $(this);
        $.get("/api/coverart/"+$(this).attr("data-story-id"),function(results){
            // if there are urls in results, split them into an array
            if (results){    
                var coverURLs = results.split(',');
                console.log("URL",coverURLs);
                $(blurb).attr('src',coverURLs[coverURLs.length-1]);
            }
        }); // end coverart ajax request  
    }); // end updateCoverThumbs function

}) // end doc ready
    