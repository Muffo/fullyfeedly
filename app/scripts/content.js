'use strict';

/**
 * Performs an XMLHttpRequest to boilerpipe to get the article content.
 *
 * @param callback Function If the response from fetching url has a
 *     HTTP status of 200, this function is called with a JSON decoded
 *     response.  Otherwise, this function is called with null.
 */
function fetchPageContent(callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var data = JSON.parse(xhr.responseText);
                callback(data);
            } else {
                callback(null);
            }
        }
    };
    // Note that any URL fetched here must be matched by a permission in
    // the manifest.json file!
    var url = 'http://boilerpipe-web.appspot.com/extract?url=http%3A%2F%2Fwww.tomshardware.com%2Freviews%2Fintel-core-i7-5960x-haswell-e-cpu%2C3918.html&extractor=ArticleExtractor&output=json&extractImages=';
    xhr.open('GET', url, true);
    xhr.send();
}

/**
 * Parses text from 
 *
 * @param data Object JSON decoded response.  Null if the request failed.
 */
function onArticleExtracted(content) {
    console.log(content);
}

/* Listen for messages */
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    /* If the received message has the expected format... */
    if (msg.text && (msg.text === 'report_back')) {
        /* Call the specified callback, passing 
           the web-pages DOM content as argument */
        // sendResponse(document.all[0].outerHTML);
        fetchPageContent(onArticleExtracted);
        sendResponse('Got it!');
    }
});


