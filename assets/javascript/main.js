$(document).foundation()

getTrending();

//createSearchListener();
//getFirstReview('Frozen');

var apiKeyMD = "api_key=7c49e1342952d7c7e126e900862f9e64"
var apiKeyHF = "hf_YOUR_TOKEN_HERE" // replace with your Hugging Face access token
var HF_BASE = "https://api-inference.huggingface.co/models/"

// API CALLS

function getReviews(id, overView) {

    var apiKeyMD = 'api_key=7c49e1342952d7c7e126e900862f9e64';
    var reviewSearch = "https://api.themoviedb.org/3/movie/" + id + "/reviews?"
    reviewSearch += apiKeyMD;

    $.ajax({
        url: reviewSearch,
        method: "GET"
    }).then(function (response) {
        console.log(response)
        var reviewsRaw = response.results;

        if (reviewsRaw.length > 0) {
            var combined = combineReviewsText(reviewsRaw);
            getFeels(combined, true);
        } else {
            console.log(overView)
            getFeels(overView, false);
        }
    })
}

function getFirstReview(movieName) {
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
        var overView = firstRes.overview;
        console.log(overView)

        updateFocus(imageUrl, firstRes.title, firstRes.release_date, getRatings(firstRes))
        getReviews(firstRes.id, overView)
    })

}

function getTrending(numTrending) {
    var apiKeyMD = 'api_key=7c49e1342952d7c7e126e900862f9e64';
    var requestUrl = 'https://api.themoviedb.org/3/movie/popular?' + apiKeyMD + '&language=en-US&page=1';

    if (numTrending === undefined) {
        numTrending = 4;
    }
    $.ajax({
        url: requestUrl,
        method: "GET"
    }).then(function (response) {
        var results = response.results;
        console.log(results);

        $('#trending').empty();
        for (var i = 0; i < numTrending; i++) {
            var movieDiv = createTrendingDiv(results[i])
            $('#trending').append(movieDiv)
        }

    })

}

function getSummary(text) {
    var decoded;
    try { decoded = decodeURIComponent(text); } catch(e) { decoded = text; }
    decoded = decoded.substring(0, 1000);
    return $.ajax({
        url: HF_BASE + "facebook/bart-large-cnn",
        method: "POST",
        contentType: "application/json",
        headers: { "Authorization": "Bearer " + apiKeyHF },
        data: JSON.stringify({ inputs: decoded })
    }).then(function(response) {
        console.log(response)
        $("#review-summary").text(response[0].summary_text);
    }).fail(function() {
        $("#review-summary").text("Summary unavailable.");
    });
}

function getParallelDotsSentiment(text) {
    var decoded;
    try { decoded = decodeURIComponent(text); } catch(e) { decoded = text; }
    decoded = decoded.substring(0, 512);
    return $.ajax({
        url: HF_BASE + "cardiffnlp/twitter-roberta-base-sentiment-latest",
        method: "POST",
        contentType: "application/json",
        headers: { "Authorization": "Bearer " + apiKeyHF },
        data: JSON.stringify({ inputs: decoded })
    }).then(function(response) {
        console.log(response)
        var scores = {};
        response[0].forEach(function(item) { scores[item.label] = item.score; });
        var pos = scores["positive"] || 0;
        var neu = scores["neutral"]  || 0;
        var neg = scores["negative"] || 0;

        var percentage = 0;
        var sentimentResult = ""

        // Assess general sentiment:
        if (pos > neu && pos > neg) {
            sentimentResult = "Somewhat Positive"
            percentage = Math.floor(pos * 100)
            if (pos > 0.5) {
                sentimentResult = "Positive"
                if (pos > 0.75) {
                    sentimentResult = "Very Positive"
                }
            }
        }
        else if (neu > pos && neu > neg) {
            sentimentResult = "Somewhat Neutral"
            percentage = Math.floor(neu * 100)
            if (neu > 0.5) {
                sentimentResult = "Neutral"
                if (neu > 0.75) {
                    sentimentResult = "Very Neutral"
                }
            }
        }
        else if (neg > pos && neg > neu) {
            sentimentResult = "Somewhat Negative"
            percentage = Math.floor(neg * 100)
            if (neg > 0.5) {
                sentimentResult = "Negative"
                if (neg > 0.75) {
                    sentimentResult = "Very Negative"
                }
            }
        }
        $("#gen-sent").text(sentimentResult + " (" + percentage + "%)");
        console.log("General Sentiment: " + sentimentResult + " (" + percentage + "%)");
    }).fail(function() {
        $("#gen-sent").text("Sentiment unavailable.");
    });
}

function getParallelDotsEmotion(text) {
    var decoded;
    try { decoded = decodeURIComponent(text); } catch(e) { decoded = text; }
    decoded = decoded.substring(0, 512);
    return $.ajax({
        url: HF_BASE + "j-hartmann/emotion-english-distilroberta-base",
        method: "POST",
        contentType: "application/json",
        headers: { "Authorization": "Bearer " + apiKeyHF },
        data: JSON.stringify({ inputs: decoded })
    }).then(function(response) {
        console.log(response)
        var emoArray = response[0].map(function(item) {
            return {
                emotion: item.label.charAt(0).toUpperCase() + item.label.slice(1),
                num: item.score
            };
        });
        emoArray.sort(function(a, b) { return b.num - a.num; });
        console.log(emoArray)

        $("#emo-reading").empty();
        for (var i = 0; i < emoArray.length; i++) {
            var percentage = Math.floor(emoArray[i].num * 100);
            var emoOut = emoArray[i].emotion + " (" + percentage + "%)";
            if (percentage > 1) {
                $("#emo-reading").append(emoOut + '<br>');
                console.log(emoOut)
            }
        }
    }).fail(function() {
        $("#emo-reading").text("Emotion data unavailable.");
    });
}

function getFeels(text, gotReview) {

    if (gotReview) {
        getSummary(text)
        getParallelDotsSentiment(text)
        getParallelDotsEmotion(text)
    } else {
        $("#review-summary").text(text)
        getParallelDotsSentiment(text)
        getParallelDotsEmotion(text)
    }

    $("#main-cell").fadeIn(1500, function () {
        // Animation complete
    });
}

function getRatings(movieData) {

    var voteAvg = movieData.vote_average;
    var voteCount = movieData.vote_count;
    console.log("vote avg: " + voteAvg + " count: " + voteCount)
    if (voteCount > 0) {
        return ("Average Rating: " + voteAvg + "<br>Total Votes: " + voteCount)
    } else return ("Average Rating: " + "N/A" + "<br>Total Votes: " + "N/A")

}

function combineReviewsText(reviewsRaw) {
    var combined = '';

    for (var i = 0; i < reviewsRaw.length; i++) {
        combined += reviewsRaw[i].content;
    }
    combined = encodeURIComponent(combined)
    if (combined.length > 9000) {
        combined = combined.substring(0, 9000)
    }

    console.log(combined.length)
    $("#total-reviews").html("Total Number of Reviews Collected: " + reviewsRaw.length)
    return combined;
}

function updateFocus(imageUrl, imageTitle, year, rating) {
    $('#focus-image').attr('src', imageUrl);
    console.log(imageTitle + '<span class="focus-year"> (' + year.substring(0, 4) + ')</span>')
    $('#focus-title').html(imageTitle + '<span class="focus-year"> (' + year.substring(0, 4) + ')</span>');
    $("#ratings").html(rating);

}

function createTrendingDiv(movieResponse, sentiment) {
    var poster = 'https://image.tmdb.org/t/p/w500' + movieResponse.poster_path;
    var title = movieResponse.title;
    var popularity = movieResponse.popularity;
    var releaseDate = movieResponse.release_date;
    var overview = movieResponse.overview;
    var genres = movieResponse.genre_ids;
    var id = movieResponse.id;

    var rating = getRatings(movieResponse);

    var movieDiv = $('<div>', { class: "cell large-3 small-6 one" });
    movieDiv.append(
        $('<div>', { class: "grid-x" }).append(
            $('<div>', { class: 'cell shad' }).append(
                $('<a>', { class: 'trending-image-cont', href: "#focus" }).append(
                    $('<img>', {
                        src: poster, alt: title, 'data-id': id, 'data-title':
                            title, 'data-year': releaseDate, 'data-rating': rating, class: "trending-images"
                    })
                )

            )
        )
    )
    var displayText = overview;
    if (sentiment !== undefined) {
        displayText = sentiment;
    }
    movieDiv.append(
        $('<div>', { class: "grid-x" }).append(
            $('<div>', { class: 'cell text' }).append(
                $('<button>', { class: 'collapsible' }).text('Show Summary'),
                $('<div>', { class: 'content' }).text(displayText).hide()
            )
        )
    )

    return movieDiv;
}

$(document).on('click', '.collapsible', function () {
    $(this).toggleClass('active')
    var $content = $(this).next();
    $content.toggle();

    $associatedImg = $(this).parent().parent().prev().find('img');
    $associatedImg.toggleClass('frosted');
})

$(document).on('click', '.trending-images', function () {
    var id = $(this).attr('data-id');
    var imgSrc = $(this).attr('src');
    var title = $(this).attr('data-title');
    var year = $(this).attr('data-year');
    var rating = $(this).attr('data-rating')
    getReviews(id)
    showFocus();
    updateFocus(imgSrc, title, year, rating)
})

function showFocus() {
    //$('#focus').attr('style', 'overflow-y:visible; max-height: 7000px; transition: max-height 0.8s;')
    if ( !$('#focus').hasClass('focus-show')){
        $('#focus').toggleClass('focus-show');
    }
}
function hideFocus(){
    $('#focus').removeClass('focus-show');
}

$('#trending-nav').on('click', function () {
    getTrending(12);
})

//smooth scroll anchor links
$(document).on('click', 'a[href^="#"]', function (event) {
    event.preventDefault();

    $('html, body').animate({
        scrollTop: $($.attr(this, 'href')).offset().top
    }, 500);
});

// Click search + enter key
function searchMovie(e) {
    e.preventDefault();

    var searchedText = $('#search-text').val().trim();

    if (searchedText.length < 1) {
        console.log('empty search')
    } else {
        console.log('searched:', searchedText);

        getFirstReview(searchedText);
        showFocus();
        $('html, body').animate({
            scrollTop: $('#focus').offset().top
        }, 500);
    }
    $('#search-text').val('');
}

$(document).on('click', '#search-button', searchMovie)

$('#search-text').keypress(function (event) {
    if (event.keyCode == 13 || event.which == 13) {
        searchMovie(event)
    }
});

$('#focus-hide').on('click', function(){
    hideFocus();
})
