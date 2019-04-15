
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

