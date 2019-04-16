
var apiKey = "480bfb040aaa88e722eb4a15ee9efd15"
var baseURL = "http://api.meaningcloud.com/"
var summaryURL = "summarization-1.0/"
var sentimentURL = "sentiment-2.1"
var queryURL = "http://en.wikipedia.org/wiki/Star_Trek";
var queryText = ""
var numSentences = 1;
var isURL = false;

var ajaxOptions = {
    url: queryURL,
    method: "GET",
    crossDomain: true,

    beforeSend: function(xhrObj){
        // Request headers
        xhrObj.setRequestHeader("Content-Type","application/json");
        xhrObj.setRequestHeader("Accept","JSON");
    }
}

queryText = "this is great"

// isURL = true;
// getSummary(queryText, isURL);
// getSentiment(queryText, isURL);


function getSummary(text, isURL){

    if (isURL) {
        return $.post(baseURL + summaryURL + "?key=" + apiKey + "&url=" + queryURL + "&sentences=" + numSentences,{ 

        }).then(function (response) { 
            console.log(response)
            console.log(response.summary)

            return response;
        })
    } else {
        return $.post(baseURL + summaryURL + "?key=" + apiKey + "&txt=" + text + "&sentences=" + numSentences,{ 

        }).then(function (response) { 
            console.log(response)
            console.log(response.summary)

            return response;
        })
    }
}

function getSentiment (text, isURL){
// Sentiment response object:
// agreement: "AGREEMENT"
// confidence: "100"
// irony: "NONIRONIC"
// model: "general_en"
// score_tag: "P+"
// sentence_list: [{…}]
// sentimented_concept_list: []
// sentimented_entity_list: []
// status: {code: "0", msg: "OK", credits: "1", remaining_credits: "19898"}
// subjectivity: "OBJECTIVE"

//  EVIDENTLY ONLY WORKS ON SINGLE SENTENCES?

    if (isURL) {
        return $.post(baseURL + sentimentURL + "?key=" + apiKey + "&url=" + queryURL + "&lang=en",{ 

        }).then(function (response) { 
            console.log(response)
            console.log("agreement: " + response.agreement)
            console.log("irony: " + response.irony)
            console.log("subjectivity: " + response.subjectivity)
            console.log("confidence: " + response.confidence)

            return response;
        })
    } else {
        return $.post(baseURL + sentimentURL + "?key=" + apiKey + "&txt=" + text + "&lang=en",{ 

        }).then(function (response) { 
            console.log(response)
            console.log(response.sentiment)
            console.log("agreement: " + response.agreement)
            console.log("irony: " + response.irony)
            console.log("subjectivity: " + response.subjectivity)
            console.log("confidence: " + response.confidence)

            return response;
        })
    }
}
//https://api-us.faceplusplus.com/facepp/v3/detect?api_key=8dOqvd6QOBI7Uy45Sp5I2cSmlYZQva13

function combineReviewsText( reviewsRaw ){
    var combined = '';
    for( var i =0; i < reviewsRaw.length; i++){
        combined += reviewsRaw[i].content;
    }
    return combined;
}

function getFirstReview( movieName ){
    var urlBase = 'https://api.themoviedb.org/3/search/movie?';
    var apiKeyPD = 'api_key=7c49e1342952d7c7e126e900862f9e64';
    var movieSearch = urlBase + apiKeyPD + '&query=' + movieName
    $.ajax({
        url: movieSearch,
        method: "GET"
    }).then(function (response) {
        console.log(response)
        var firstRes = response.results[0];

        var reviewSearch = "https://api.themoviedb.org/3/movie/" + firstRes.id + "/reviews?"
        reviewSearch += apiKeyPD;
        $.ajax({
            url: reviewSearch,
            method: "GET"
        }).then(function (response) {
            console.log(response)
            var reviewsRaw = response.results;

            var combined = combineReviewsText( reviewsRaw );

            var sentiment = getParallelDotsSentiment( combined )

            var movieDiv = createMovieDiv(firstRes, sentiment);
            $('#movie-holder').append(movieDiv)

            console.log(combined) //will go into sentiment api
        })
    })
}

//getFirstReview( 'Frozen' );

function getTrending(){
    var apiKeyPD = 'api_key=7c49e1342952d7c7e126e900862f9e64';
    var requestUrl = 'https://api.themoviedb.org/3/movie/popular?'+ apiKeyPD +'&language=en-US&page=1';

    $.ajax({
        url: requestUrl,
        method: "GET"
    }).then(function (response) {
        var results = response.results;
        console.log( results );

        for(var i =0; i < 4; i++){
            var movieDiv = createMovieDiv( results[i] )
            $('#trending').append( movieDiv )
        }

    })

}
//getTrending();

function createSearchListener(){
    var $searchButton = $('#search-button');
    var $searchText = $('#search-text');
    $searchButton.on('click', function(){
        var searchedText = $searchText.val();
        console.log('searched:', searchedText);

        getFirstReview(searchedText);

        $searchText.val('');
    })
}
createSearchListener();

function getParallelDotsSentiment( text ){
    return $.post("https://apis.paralleldots.com/v4/sentiment",{ 
        api_key: "nNrvGbJRqlR7VMkESMFaKRm6Rh5gnsmhYtf6N3trZzI", 
        text: text 
    }).then(function (response) { 
        console.log(response)
        return response;
    })
}

function createMovieDiv (movieResponse, sentiment){
    var poster = 'https://image.tmdb.org/t/p/w500'+ movieResponse.poster_path;
    var title = movieResponse.title;
    var popularity = movieResponse.popularity;
    var releaseDate = movieResponse.release_date;
    var overview = movieResponse.overview;
    var genres = movieResponse.genre_ids;
    var id = movieResponse.id;

    var movieDiv = $('<div>');
    movieDiv.append( $('<img>', {src: poster, alt: title}) )
    if( sentiment !== undefined ){
        movieDiv.append($('<p>').text(sentiment))
    }

    return movieDiv;
}
