function summarizeTextLocal(text, sentenceCount) {
    var cleanedText = (text || '').replace(/\s+/g, ' ').trim();

    if (!cleanedText) {
        return '';
    }

    var sentences = cleanedText.match(/[^.!?]+[.!?]+["')\]]*|[^.!?]+$/g) || [cleanedText];
    if (sentences.length <= sentenceCount) {
        return sentences.join(' ');
    }

    var stopWords = {
        the: true, a: true, an: true, and: true, or: true, but: true,
        if: true, then: true, than: true, so: true, to: true, of: true,
        in: true, on: true, for: true, with: true, at: true, by: true,
        from: true, as: true, is: true, are: true, was: true, were: true,
        be: true, been: true, being: true, it: true, its: true, this: true,
        that: true, these: true, those: true, he: true, she: true, they: true,
        them: true, his: true, her: true, their: true, you: true, your: true,
        we: true, our: true, i: true, me: true, my: true, not: true, no: true,
        do: true, does: true, did: true, have: true, has: true, had: true,
        will: true, would: true, can: true, could: true, should: true,
        about: true, into: true, over: true, after: true, before: true,
        through: true, during: true, out: true, up: true, down: true,
        off: true, again: true, very: true
    };

    var frequencies = {};
    var allWords = cleanedText.toLowerCase().match(/[a-z']+/g) || [];
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
        .slice(0, sentenceCount || 5)
        .sort(function (a, b) {
            return a.index - b.index;
        })
        .map(function (item) {
            return item.sentence;
        })
        .join(' ');
}

getSummary = function (text) {
    var summary = summarizeTextLocal((text || '').substring(0, 6000), typeof numSentences === 'number' ? numSentences : 5);
    $('#review-summary').text(summary || 'No summary available.');
    return $.Deferred().resolve({ summary: summary }).promise();
};

combineReviewsText = function (reviewsRaw) {
    var combined = '';

    for (var i = 0; i < reviewsRaw.length; i++) {
        combined += reviewsRaw[i].content + ' ';
    }

    combined = combined.replace(/\s+/g, ' ').trim();

    if (combined.length > 9000) {
        combined = combined.substring(0, 9000);
    }

    console.log(combined.length);
    $('#total-reviews').html('Total Number of Reviews Collected: ' + reviewsRaw.length);
    return combined;
};
