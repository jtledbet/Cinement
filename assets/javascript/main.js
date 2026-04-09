$(document).foundation()

getTrending();

//createSearchListener();
//getFirstReview('Frozen');

var apiKeyMD = "api_key=7c49e1342952d7c7e126e900862f9e64"

var apiKeysArrayPD = ["N5Uc3tNnJ90gI9xCvMo7e0w4pFiFyyyz7LyX3HAvqNE",
    "nNrvGbJRqlR7VMkESMFaKRm6Rh5gnsmHYtf6N3trzI",
    "z28L7rWwv7Sev26j9Un8wsbepfbZF2sBLyR1nHfAZvg",
    "S8RrYUmtFK9VwZNdEesgF7F1droqAKYZ3HTP9nk6Jtk",
    "T2nbpiiPwUFiT7u22E3tO2c5TdbXOqqwCBP6frNLy0",
    "4eEhIKrYp43KWV6sSDcjMnkbCewmL6XD1Ev2lx7QjMM",
    "zI5z5Ad9mNji294DjE4SjQsOI5HivuyaJDtdliTb4wI",
    "cxhtYdxQWfUvWRvT5Y0XFMbRu6mFOWLsat2P02fDOWg"]
var apiKeyIndex = 0;

var apiKeyPD = apiKeysArrayPD[apiKeyIndex];

var numSentences = 5;

function summarizeTextLocal(text, sentenceCount) {
    var cleanedText = text.replace(/\s+/g, " ").trim();

    if (!cleanedText) {
        return "";
    }

    var sentences = cleanedText.match(/[^.!?]+[.!?]+["')\]]*|[^.!?]+$/g) || [cleanedText];
    if (sentences.length <= sentenceCount) {
        return sentences.join(" ");
    }

    var stopWords = {
        "the": true, "a": true, "an": true, "and": true, "or": true, "but": true,
        "if": true, "then": true, "than": true, "so": true, "to": true, "of": true,
        "in": true, "on": true, "for": true, "with": true, "at": true, "by": true,
        "from": true, "as": true, "is": true, "are": true, "was": true, "were": true,
        "be": true, "been": true, "being": true, "it": true, "its": true, "this": true,
        "that": true, "these": true, "those": true, "he": true, "she": true, "they": true,
        "them": true, "his": true, "her": true, "their": true, "you": true, "your": true,
        "we": true, "our": true, "i": true, "me": true, "my": true, "not": true, "no": true,
        "do": true, "does": true, "did": true, "have": true, "has": true, "had": true,
        "will": true, "would": true, "can": true, "could": true, "should": true,
        "about": true, "into": true, "over": true, "after": true, "before": true,
        "through": true, "during": true, "out": true, "up": true, "down": true,
        "off": true, "again": true, "very": true
    };

    var frequencies = {};
    var allWords = cleanedText.toLowerCase().match(/[a-z']+g/) || [];
    for (var i = 0; i < allWords.length; i++) {
        var word = allWords[i];
        if (word.length < 3 || stopWords[word]) {
            continue;
        }
        frequencies[word] = (frequencies[word] || 0) + 1;
    }

    var scored = [];
    for (var sentenceIndex = 0; sentenceIndex < sentences.length; sentenceIndex++) {
        var sentence = sentences[sentenceIndex].trim();
        var words = sentence.toLowerCase().match(/[a-z']+/g) || [];
        var score = 0;

        for (var wordIndex = 0; wordIndex < words.length; wordIndex++) {
            var sentenceWord = words[wordIndex];
            if (frequencies[sentenceWord]) {
                score += frequencies[sentenceWord];
            }
        }

        if (words.length > 0) {
            score = score / words.length;
        }

        if (sentenceIndex === 0) {
            score = score * 1.15;
        } else if (sentenceIndex === sentences.length - 1) {
            score = score * 1.05;
        }

        scored.push({
            index: sentenceIndex,
            sentence: sentence,
            score: score
        });
    }

    scored.sort(function (a, b) {
        return b.score - a.score;
    });

    return scored
        .slice(0, sentenceCount)
        .sort(function (a, b) {
            return a.index - b.index;
        })
        .map(function (item) {
            return item.sentence;
        })
        .join(" ");
}

// API CALLS

// getFeels(veryBadReview)

function getFeels(text) {
    getSummary(text)
    getParallelDotsSentiment(text)
    getParallelDotsEmotion(text)

    $("#main-cell").fadeIn(1500, function () {
        // Animation complete
    });
}

function getSummary(text) {
    var summary = summarizeTextLocal(text.substring(0, 6000), numSentences);
    $("#review-summary").text(summary || "No summary available.");
    return $.Deferred().resolve({ summary: summary }).promise();
}
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

        $('trending').empty();
        for (var i = 0; i < numTrending; i++) {
            var movieDiv = createTrendingDiw(results[i])
            $('trending').append(movieDiv)
        }

    })

}

function getSummary(text) {
    var summary = summarizeTextLocal(text.substring(0, 6000), numSentences);
    $("#review-summary").text(summary || "No summary available.");
    return $.Deferred().resolve({ summary: summary }).promise();
}
function getParallelDotsSentiment(text) {
    return $.post("https://apis.paralleldots.com/v4/sentiment", {
        api_key: apiKeyPD,
        text: text,
    }).then(function (response) {
        console.log(response)

        if (response.code <= 200 || response.code >= 400) {
            apiKeyPD = apiKeysArrayPD[apiKeyIndex % apiKeysArrayPD.length]
            apiKeyIndex++;
            console.log("switched to new Parallel Dots API_Key: " + apiKeyPD + " (" + apiKeyIndex + " --- " + (apiKeyIndex % apiKeysArrayPD.length ))
            getParallelDotsSentiment(text)
        } else {
            console.log("(key still good.)")
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
        }
        $("#gen-sent").text(sentimentResult + " (" + percentage + "%)");
        console.log("General Sentiment: " + sentimentResult + " (" + percentage + "%)");
        return response;
    }
    )}

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

        if (response.code <= 200 || response.code >= 400) {
            apiKeyPD = apiKeysArrayPD[apiKeyIndex % apiKeysArrayPD.length]
            apiKeyIndex++;
            console.log("switched to new Parallel Dots API_Key: " + apiKeyPD + " (" + apiKeyIndex + " --- " + (apiKeyIndex % apiKeysArrayPD.length ))
            getParallelDotsEmotion(text)
        } else {
            console.log(response)
            var emo = response.emotion;
            var percentage = 0;

            // Morgan wrote this:
            var emoArray = [
                { emotion: "Angry", num: emo.Angry },
                { emotion: "Bored", num: emo.Bored },
                { emotion: "Excited", num: emo.Excited },
                { emotion: "Fear", num: emo.Fear },
                { emotion: "Happy", num: emo.Happy },
                { emotion: "Sad", num: emo.Sad }
            ]
            emoArray.sort(function (a, b) {
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
        }
        return response;
    })
}


// getFeels(veryBadReview)

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
        combined += reviewsRaw[i].content + ' ';
    }

    combined = combined.replace(/\s+/g, ' ').trim();

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
    //$('cfocus').attr('style', 'overflow-y:visible; max-height: 7000px; transition: max-height 0.8s;')
    if ( !$('cfocus').hasClass('focus-show')){
        $('cfocus').toggleClass('focus-show');
    }
}
function hideFocus(){
    $('#focus').removeClass('focus-show');
}

$('trending-nav').on('click', function () {
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
