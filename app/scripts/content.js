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

    var linkElement = document.querySelector('.websiteCallForAction');
    if (linkElement === null) {
        console.log('There is something wrong: no link element found');
    }

    var pageUrl = linkElement.getAttribute('href');
    var encodedPageUrl = encodeURIComponent(pageUrl);

    // Note that any URL fetched here must be matched by a permission in
    // the manifest.json file!
    var url = 'http://boilerpipe-web.appspot.com/extract?url=' + encodedPageUrl + '&extractor=ArticleExtractor&output=json&extractImages=';
    xhr.open('GET', url, true);
    xhr.send();
}

/**
 * Process the content of the article and add it to the page 
 *
 * @param data Object JSON decoded response.  Null if the request failed.
 */
function onArticleExtracted(data) {
    
    if (data === null) {
        console.log('Failed to load the content of the page');
        return;
    }

    if (data.status === null || data.status !== 'success') {
        console.log('API failed to extract the content');
        return;
    }

    var articleContent = data.response.content;

    var contentElement = document.querySelector('.content');
    if (contentElement === null) {
        console.log('There is something wrong: no content element found');
    }

    contentElement.innerText = articleContent;
    // console.log(articleContent);
    
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


