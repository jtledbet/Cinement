$(document).foundation()

getTrending();

createSearchListener();
//getFirstReview('Frozen');

var apiKeyMC = "480bfb040aaa88e722eb4a15ee9efd15"
var apiKeyPD = "S8RrYUmtFK9VwZNdEesgF7F1droqAKYZ3HTP9nk6Jtk"
var apiKeyMD = "api_key=7c49e1342952d7c7e126e900862f9e64"

var baseURL = "https://api.meaningcloud.com/"
var summaryURL = "summarization-1.0/"
var sentimentURL = "sentiment-2.1"
var numSentences = 3;
var queryURL = "";

var gettysBurg = "Four score and seven years ago our fathers brought forth on this continent, a new nation, conceived in Liberty, and dedicated to the proposition that all men are created equal. Now we are engaged in a great civil war, testing whether that nation, or any nation so conceived and so dedicated, can long endure. We are met on a great battle-field of that war. We have come to dedicate a portion of that field, as a final resting place for those who here gave their lives that that nation might live. It is altogether fitting and proper that we should do this. But, in a larger sense, we can not dedicate -- we can not consecrate -- we can not hallow -- this ground. The brave men, living and dead, who struggled here, have consecrated it, far above our poor power to add or detract. The world will little note, nor long remember what we say here, but it can never forget what they did here. It is for us the living, rather, to be dedicated here to the unfinished work which they who fought here have thus far so nobly advanced. It is rather for us to be here dedicated to the great task remaining before us -- that from these honored dead we take increased devotion to that cause for which they gave the last full measure of devotion -- that we here highly resolve that these dead shall not have died in vain -- that this nation, under God, shall have a new birth of freedom -- and that government of the people, by the people, for the people, shall not perish from the earth."
var veryBadReview = "I hated this movie. Hated, hated, hated, hated, hated this movie. Hated it. Hated every simpering stupid vacant audience-insulting moment of it. Hated the sensibility that thought anyone would like it. Hated the implied insult to the audience by its belief that anyone would be entertained by it."
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


// getFeels(veryBadReview)

function getFeels(text) {
    getSummary(text)
    getParallelDotsSentiment(text)
    getParallelDotsEmotion(text)
}

function getSummary(text){
    text = text.substring(0,6000)
    console.log(baseURL + summaryURL + "?key=" + apiKeyMC + "&txt=" + text + "&sentences=" + numSentences )
    return $.post(baseURL + summaryURL + "?key=" + apiKeyMC + "&txt=" + text + "&sentences=" + numSentences,{ 

    }).then(function (response) { 
        console.log(response)
        console.log(response.summary)
        $("#review-summary").text(response.summary)
        return response;
    })
}

function getSentimentMC (text){
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

    return $.post(baseURL + sentimentURL + "?key=" + apiKeyMC + "&txt=" + text + "&lang=en",{ 

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

function combineReviewsText( reviewsRaw ){
    var combined = '';

    for( var i = 0; i < reviewsRaw.length; i++){
        combined += reviewsRaw[i].content;
    }
    combined = encodeURIComponent(combined)
    if( combined.length > 9000 ){
        combined = combined.substring(0, 9000)
    }

    console.log(combined.length)
    return combined;
}

function getReviews( id ){

    var apiKeyMD = 'api_key=7c49e1342952d7c7e126e900862f9e64';
    var reviewSearch = "https://api.themoviedb.org/3/movie/" + id + "/reviews?"
    reviewSearch += apiKeyMD;
    $.ajax({
        url: reviewSearch,
        method: "GET"
    }).then(function (response) {
        console.log(response)
        var reviewsRaw = response.results;

        var combined = combineReviewsText(reviewsRaw);
        
        getFeels(combined);
    })
}

function getFirstReview( movieName ){
    var urlBase = 'https://api.themoviedb.org/3/search/movie?';
    var apiKeyMD = 'api_key=7c49e1342952d7c7e126e900862f9e64';
    var movieSearch = urlBase + apiKeyMD + '&query=' + movieName
    $.ajax({
        url: movieSearch,
        method: "GET"
    }).then(function (response) {
        console.log(response)
        var firstRes = response.results[0];

        var imageUrl = 'https://image.tmdb.org/t/p/w500' + firstRes.poster_path;

        updateFocus( imageUrl, firstRes.title, firstRes.release_date )
        getReviews( firstRes.id )
    })
}


function getTrending(numTrending){
    var apiKeyMD = 'api_key=7c49e1342952d7c7e126e900862f9e64';
    var requestUrl = 'https://api.themoviedb.org/3/movie/popular?'+ apiKeyMD +'&language=en-US&page=1';

    if ( numTrending === undefined){
        numTrending = 4;
    }
    $.ajax({
        url: requestUrl,
        method: "GET"
    }).then(function (response) {
        var results = response.results;
        console.log( results );

        $('#trending').empty();
        for(var i = 0; i < numTrending; i++){
            var movieDiv = createTrendingDiv( results[i] )
            $('#trending').append( movieDiv )
        }

    })

}

function createSearchListener(){
    var $searchButton = $('#search-button');
    var $searchText = $('#search-text');
    $searchButton.on('click', function(e){
        e.preventDefault();

        var searchedText = $searchText.val().trim();
        
        if( searchedText.length < 1){
            console.log('empty search')
        } else {
            console.log('searched:', searchedText);

            getFirstReview(searchedText);
            showFocus();
        }
        

        $searchText.val('');
    })
}


function getParallelDotsSentiment( text ){
    return $.post("https://apis.paralleldots.com/v4/sentiment",{ 
        api_key: apiKeyPD, 
        text: text,
    }).then(function (response) { 
        console.log(response)

        var sent = response.sentiment;

        var neg = sent.negative;
        var neu = sent.neutral;
        var pos = sent.positive;

        var percentage = 0;
        var sentimentResult = "" 

        // Assess general sentiment:
        if (pos > neu && pos > neg) {
            sentimentResult = "Somewhat Positive"
            percentage = Math.floor(pos * 100)
            if (pos > 0.5) {
                sentimentResult = "Positive"
                if (pos > 0.7) {
                    sentimentResult = "Very Positive"
                }
            }
		}
		else if (neu > pos && neu > neg) {
            sentimentResult = "Somewhat Neutral"
            percentage = Math.floor(neu * 100)
            if (neu > 0.5) {
                sentimentResult = "Neutral"
                if (neu > 0.7) {
                    sentimentResult = "Very Neutral"
                }
            }
		}
		else if (neg > pos && neg > neu) {
            sentimentResult = "Somewhat Negative"
            percentage = Math.floor(neg * 100)
            if (neg > 0.5) {
                sentimentResult = "Negative"
                if (neg > 0.7) {
                    sentimentResult = "Very Negative"
                }
            }
        }

        $("#gen-sent").text(sentimentResult + " (" + percentage + "%)"); 
        console.log("General Sentiment: " + sentimentResult + " (" + percentage + "%)"); 
        return response;
    })
}

function getParallelDotsKeyword(text) {

    // form: {text:text,api_key:API_KEY}}
    // currently does not work (error 500)

    return $.post("https://apis.paralleldots.com/v4/keywords", {
        api_key: apiKeyPD,
        text: text,
    }).then(function (response) {
        console.log(response)

        return response;    
    })
}

function getParallelDotsEmotion(text) {

    // Angry: 0.0990534595
    // Bored: 0.0390271503
    // Excited: 0.2811283671
    // Fear: 0.0782141498
    // Happy: 0.4178697705
    // Sad: 0.0847071027

    // form: {text:text,api_key:API_KEY}}

    return $.post("https://apis.paralleldots.com/v4/emotion", {
        api_key: apiKeyPD,
        text: text,
    }).then(function (response) {
        console.log(response)
        var emo = response.emotion;
        var percentage = 0;
        
        // Morgan wrote this:
        var emoArray = [
            {emotion: "Angry", num: emo.Angry},
            {emotion: "Bored", num: emo.Bored}, 
            {emotion: "Excited", num: emo.Excited},
            {emotion: "Fear", num: emo.Fear},
            {emotion: "Happy", num: emo.Happy},
            {emotion: "Sad", num: emo.Sad}
          ]
          emoArray.sort(function(a, b) {
              return a.num - b.num;
          });
          
          emoArray.reverse();
          console.log(emoArray)

        $("#emo-reading").empty();
        for (var i = 0; i < emoArray.length; i++) {
            percentage = Math.floor(emoArray[i].num * 100);
            var emoOut = emoArray[i].emotion + " (" + percentage + "%)";
            
            if (percentage > 1) {
                $("#emo-reading").append(emoOut + '<br>'); 
                console.log(emoOut)
            }
        }

        return response; 
    })
}

/*
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
*/
function updateFocus(imageUrl, imageTitle, year){
    $('#focus-image').attr('src', imageUrl);
    console.log(imageTitle + '<span class="focus-year">(' + year.substring(0,4) + ')</span>' )
    $('#focus-title').html(imageTitle + '<span class="focus-year">(' + year.substring(0, 4) + ')</span>');

}

function createTrendingDiv(movieResponse, sentiment) {
    var poster = 'https://image.tmdb.org/t/p/w500' + movieResponse.poster_path;
    var title = movieResponse.title;
    var popularity = movieResponse.popularity;
    var releaseDate = movieResponse.release_date;
    var overview = movieResponse.overview;
    var genres = movieResponse.genre_ids;
    var id = movieResponse.id;

    var movieDiv = $('<div>', { class: "cell large-3 small-6 one" });
    movieDiv.append(
        $('<div>', { class: "grid-x" }).append( 
              $('<div>', {class: 'cell shad'}).append(
                  $('<a>', {class: 'trending-image-cont', href: "#focus"}).append(
                      $('<img>', {src: poster, alt: title, 'data-id': id, 'data-title': title, 'data-year': releaseDate, class:"trending-images"})
                  )
                  
              )
            )
    )
    var displayText = overview;
    if (sentiment !== undefined){
        displayText = sentiment;
    }
    movieDiv.append(
        $('<div>', { class: "grid-x" }).append(
            $('<div>', { class: 'cell text' }).append(
                $('<button>', {class:'collapsible'}).text('Show Summary'),
                $('<div>', {class:'content'}).text( displayText ).hide()
            )
        )
    )

    return movieDiv;
}
$(document).on('click', '.collapsible', function () {
    $(this).toggleClass('active')
    var $content = $(this).next();
    $content.toggle();
})

$(document).on('click', '.trending-images', function(){
    var id = $(this).attr('data-id');
    var imgSrc = $(this).attr('src');
    var title = $(this).attr('data-title');
    var year = $(this).attr('data-year');
    getReviews(id)
    showFocus();
    updateFocus(imgSrc, title, year)
})
function showFocus(){
    $('#focus').attr('style', 'overflow-y:visible; max-height: 7000px; transition: max-height 0.8s;')
}
$('#trending-nav').on('click', function(){
    getTrending(12);
})

//smooth scroll anchor links
$(document).on('click', 'a[href^="#"]', function (event) {
    event.preventDefault();

    $('html, body').animate({
        scrollTop: $($.attr(this, 'href')).offset().top
    }, 500);
});