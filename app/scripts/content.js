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

    var linkElements = document.getElementsByClassName('websiteCallForAction');
    if (linkElements.length === 0) {
        console.log('There is something wrong: no link element found');
    }
    if (linkElements.length > 1) {
        console.log('There is something wrong: more than one link element found');
    }

    var pageUrl = linkElements[0].getAttribute('href');
    var encodedPageUrl = encodeURIComponent(pageUrl);

    // Note that any URL fetched here must be matched by a permission in
    // the manifest.json file!
    var url = 'http://boilerpipe-web.appspot.com/extract?url=' + encodedPageUrl + '&extractor=ArticleExtractor&output=json&extractImages=';
    xhr.open('GET', url, true);
    xhr.send();
}

/**
 * Parses text from 
 *
 * @param data Object JSON decoded response.  Null if the request failed.
 */
function onArticleExtracted(data) {
    
    if (data.status && data.status === 'success')
    {
        var articleContent = data.response.content;

        var contentElements = document.getElementsByClassName('content');
        if (contentElements.length === 0) {
            console.log('There is something wrong: no link element found');
        }
        if (contentElements.length > 1) {
            console.log('There is something wrong: more than one link element found');
        }

        contentElements[0].innerText = articleContent;
        console.log(articleContent);
    }
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


