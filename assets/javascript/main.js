// 8dOqvd6QOBI7Uy45Sp5I2cSmlYZQva13

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
    var apiKey = 'api_key=7c49e1342952d7c7e126e900862f9e64';
    var movieSearch = urlBase + apiKey + '&query=' + movieName
    $.ajax({
        url: movieSearch,
        method: "GET"
    }).then(function (response) {
        console.log(response)
        var firstRes = response.results[0];

        var reviewSearch = "https://api.themoviedb.org/3/movie/" + firstRes.id + "/reviews?"
        reviewSearch += apiKey;
        $.ajax({
            url: reviewSearch,
            method: "GET"
        }).then(function (response) {
            console.log(response)
            var reviewsRaw = response.results;

            var combined = combineReviewsText( reviewsRaw );

            console.log(combined) //will go into sentiment api
        })
    })
}

getFirstReview( 'Frozen' );

function createSearchListener(){
    var $searchButton = $('#search-button');
    var $searchText = $('#search-text');
    $searchButton.on('click', function(){
        var searchedText = $searchText.val();
        console.log('searched:', searchedText);

        $searchText.val('');
    })
}
createSearchListener();