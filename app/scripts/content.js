'use strict';

/**
 * Performs an XMLHttpRequest to boilerpipe to get the content of the artile.
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

    // Search the link of the article that is currently opened
    var linkElement = document.querySelector('.websiteCallForAction');
    if (linkElement === null) {
        console.log('There is something wrong: no link element found');
        return;
    }

    // Get the link and convert it for usage as parameter in the GET request
    var pageUrl = linkElement.getAttribute('href');
    var encodedPageUrl = encodeURIComponent(pageUrl);

    // Prepare the request to Boilerpipe
    var url = 'http://boilerpipe-web.appspot.com/extract?url=' +
                encodedPageUrl +
                '&extractor=ArticleExtractor&output=json&extractImages=';
    xhr.open('GET', url, true);
    xhr.send();
}

/**
 * Process the content of the article and add it to the page 
 *
 * @param data Object JSON decoded response.  Null if the request failed.
 */
function onArticleExtracted(data) {
   
    // Check if the request failed 
    if (data === null) {
        console.log('Failed to load the content of the page');
        return;
    }
    
    // Check if the API failed to extract the text
    if (data.status === null || data.status !== 'success') {
        console.log('API failed to extract the content');
        return;
    }

    // Get the content of the article
    var articleContent = data.response.content;

    // Search the element of the page that will containt the text
    var contentElement = document.querySelector('.content');
    if (contentElement === null) {
        console.log('There is something wrong: no content element found');
        return;
    }
    
    // If there is an image we want to keep it
    var articleImage = contentElement.querySelector('img');
    if (articleImage !== null) {
        articleImage = articleImage.cloneNode();
    }

    // Replace the preview of the article with the full text
    contentElement.innerText = articleContent;

    // Put the image back at the beginning of the article
    if (articleImage !== null) {
        contentElement.insertBefore(articleImage, contentElement.firstChild);
    }
    
}

/* Listen for requests */
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    // If the received message has the expected format...
    if (msg.text && (msg.text === 'extract_article')) {
        // Perform the specified operation
        fetchPageContent(onArticleExtracted);
        sendResponse('Got it!');
    }
});


