/*global Spinner:false, iosOverlay:false */


'use strict';

/**
 * Process the content of the article and add it to the page 
 *
 * @param data Object JSON decoded response.  Null if the request failed.
 */
function onArticleExtracted(data, overlay) {
    
    // Check if the API failed to extract the text
    if (data.status === null || data.status !== 'success') {
        console.log('[FullyFeedly] API failed to extract the content');
        overlay.update({
            text: 'Article not loaded',
            duration: 3e3,
            icon: chrome.extension.getURL('images/cross.png')
        });
        return;
    }

    // Get the content of the article
    var articleContent = data.response.content;

    // Search the element of the page that will containt the text
    var contentElement = document.querySelector('.content');
    if (contentElement === null) {
        console.log('[FullyFeedly] There is something wrong: no content element found');
        overlay.update({
            text: 'No content',
            duration: 3e3,
            icon: chrome.extension.getURL('images/cross.png')
        });
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
    
    overlay.update({
        text: 'Done',
        duration: 3e3,
        icon: chrome.extension.getURL('images/check.png')
    });
}

function boilerpipeRequest(xhr, overlay) {
    return function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                // Operation succeded
                var data = JSON.parse(xhr.responseText);
                onArticleExtracted(data, overlay);
            } else if (xhr.status === 503) {
                console.log('[FullyFeedly] Boilerpipe API exceeded quota');
                overlay.update({
                    text: 'API over quota',
                    duration: 3e3,
                    icon: chrome.extension.getURL('images/cross.png')
                });
            } else {
                console.log('[FullyFeedly] Failed to load the content of the page');
                overlay.update({
                    text: 'Article not loaded',
                    duration: 3e3,
                    icon: chrome.extension.getURL('images/cross.png')
                });
            }
        }
    };
}

function createLoadingOverlay() {

    // Spinner options
    var spinOpts = {
		lines: 13,  // The number of lines to draw
		length: 11, // The length of each line
		width: 5,   // The line thickness
		radius: 17, // The radius of the inner circle
		corners: 1, // Corner roundness (0..1)
		rotate: 0,  // The rotation offset
		color: '#FFF', // #rgb or #rrggbb
		speed: 1,   // Rounds per second
		trail: 60,  // Afterglow percentage
		shadow: false, // Whether to render a shadow
		hwaccel: false, // Whether to use hardware acceleration
		className: 'spinner', // The CSS class to assign to the spinner
		zIndex: 2e9, // The z-index (defaults to 2000000000)
		top: 'auto', // Top position relative to parent in px
		left: 'auto' // Left position relative to parent in px
	};
    
    // Create the spinner and the overlay
	var target = document.createElement('div');
	document.body.appendChild(target);
	var spinner = new Spinner(spinOpts).spin(target);
    var overlay = iosOverlay({
        text: 'Loading',
        duration: 2e3,
        spinner: spinner
    });

    return overlay;
}

/**
 * Performs an XMLHttpRequest to boilerpipe to get the content of the artile.
 *
 * @param callback Function If the response from fetching url has a
 *     HTTP status of 200, this function is called with a JSON decoded
 *     response.  Otherwise, this function is called with null.
 */
function fetchPageContent() {

    // Search the link of the article that is currently opened
    var linkElement = document.querySelector('.websiteCallForAction');
    if (linkElement === null) {
        console.log('[FullyFeedly] Link to article not found');
        iosOverlay({
            text: 'Article not found',
            duration: 2e3,
            icon: chrome.extension.getURL('images/cross.png')
        });
        return;
    }

    // Get the link and convert it for usage as parameter in the GET request
    var pageUrl = linkElement.getAttribute('href');
    var encodedPageUrl = encodeURIComponent(pageUrl);

    // Prepare the request to Boilerpipe
    var url = 'http://boilerpipe-web.appspot.com/extract?url=' +
                encodedPageUrl +
                '&extractor=ArticleExtractor&output=json&extractImages=';

    var overlay = createLoadingOverlay();
   
    // Create the asynch HTTP request 
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = boilerpipeRequest(xhr, overlay);
    xhr.open('GET', url, true);
    xhr.send();
}



/* Listen for requests */
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    // If the received message has the expected format...
    if (msg.text && (msg.text === 'extract_article')) {
        // Perform the specified operation
        fetchPageContent();
        sendResponse('Got it!');
    }
});


