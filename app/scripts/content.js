/*global Spinner:false, iosOverlay:false */


'use strict';

/* ===================== Options ===================== */
var options = {
    extractionAPI: 'Boilerpipe',
    readabilityAPIKey: ''
};

// Restores the options using the preferences stored in chrome.storage.
(function restoreOptions() {
    chrome.storage.sync.get({
        extractionAPI: 'Boilerpipe',
        readabilityAPIKey: ''
    }, function(items) {
        options = items;
        console.log('[FullyFeedly] Loaded options: ', options);
    });
})();



/* ===================== Notifications ===================== */
function loadingOverlay() {

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
        spinner: spinner
    });

    return overlay;
}

function genericOverlay(message, icon, duration, overlay) {

    if (overlay === undefined || overlay === null) {
        overlay = iosOverlay({
            text: message,
            icon: icon
        });
    }
    else {
        overlay.update({
            text: message,
            icon: icon
        });
    }
    window.setTimeout(function() {
        overlay.hide();
    }, duration);

}

function successOverlay(message, overlay) {
    genericOverlay(message, chrome.extension.getURL('images/check.png'), 1e3, overlay);
}

function failOverlay(message, overlay) {
    genericOverlay(message, chrome.extension.getURL('images/cross.png'), 2e3, overlay);
}



/* ===================== Boilerpipe ===================== */
/**
 * Process the content of the article and add it to the page 
 *
 * @param data Object JSON decoded response.  Null if the request failed.
 */
function onBoilerpipeArticleExtracted(data, overlay) {
    
    // Check if the API failed to extract the text
    if (data.status === null || data.status !== 'success') {
        console.log('[FullyFeedly] API failed to extract the content');
        failOverlay('Article not loaded', overlay);
        return;
    }

    // Get the content of the article
    var articleContent = data.response.content;

    // Search the element of the page that will containt the text
    var contentElement = document.querySelector('.content');
    if (contentElement === null) {
        console.log('[FullyFeedly] There is something wrong: no content element found');
        failOverlay('No content', overlay);
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
    
    successOverlay('Done', overlay);
}

function boilerpipeRequest(xhr, overlay) {
    return function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                // Operation succeded
                var data = JSON.parse(xhr.responseText);
                onBoilerpipeArticleExtracted(data, overlay);
            } else if (xhr.status === 503) {
                console.log('[FullyFeedly] Boilerpipe API exceeded quota');
                failOverlay('API over quota', overlay);
            } else {
                console.log('[FullyFeedly] Failed to load the content of the page');
                failOverlay('Article not found', overlay);
            }
        }
    };
}

/* ===================== Readability ===================== */
/**
 * Process the content of the article and add it to the page 
 */
function onReadabilityArticleExtracted(data, overlay) {
    
    // Check if the API failed to extract the text
    if (data.content === null) {
        console.log('[FullyFeedly] API failed to extract the content');
        failOverlay('Article not loaded', overlay);
        return;
    }

    // Get the content of the article
    var articleContent = data.content;

    // Search the element of the page that will containt the text
    var contentElement = document.querySelector('.content');
    if (contentElement === null) {
        console.log('[FullyFeedly] There is something wrong: no content element found');
        failOverlay('No content', overlay);
        return;
    }
    
    // Replace the preview of the article with the full text
    contentElement.innerHTML = articleContent;
    successOverlay('Done', overlay);
}

function readabilityRequest(xhr, overlay) {
    return function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                // Operation succeded
                var data = JSON.parse(xhr.responseText);
                onReadabilityArticleExtracted(data, overlay);
            } else if (xhr.status === 400) {
                console.log('[FullyFeedly] Readability API Bad request: ' +
                            'The server could not understand your request. ' +
                            'Verify that request parameters (and content, if any) are valid.');
                failOverlay('API bad request', overlay);
            } else if (xhr.status === 400) {
                console.log('[FullyFeedly] Readability API Authorization Required: ' +
                            'Authentication failed or was not provided.');
                failOverlay('API authorization required', overlay);
            } else {
                console.log('[FullyFeedly] Readability API Unknown error');
                failOverlay('API unknown error', overlay);
            }
        }
    };
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
        failOverlay('Article not found');
        return;
    }

    
    // Get the link and convert it for usage as parameter in the GET request
    var pageUrl = linkElement.getAttribute('href');
    var encodedPageUrl = encodeURIComponent(pageUrl);
    
    // Show loading overlay
    var overlay = loadingOverlay();

    // Create the asynch HTTP request 
    var xhr = new XMLHttpRequest();
    var url = '';

    if (options.extractionAPI === 'Boilerpipe') {
        // Prepare the request to Boilerpipe
        url = 'http://boilerpipe-web.appspot.com/extract?url=' +
                encodedPageUrl +
                '&extractor=ArticleExtractor&output=json&extractImages=';

        xhr.onreadystatechange = boilerpipeRequest(xhr, overlay);
    }
    else if (options.extractionAPI === 'Readability') {
        // Check if the key is set
        if (options.readabilityAPIKey === '') {
            failOverlay('Missing API Key', overlay);
            return;
        }

        // Prepare the request to Readability
        url = 'http://www.readability.com/api/content/v1/parser?url=' +
                encodedPageUrl + '&token=' + options.readabilityAPIKey;

        xhr.onreadystatechange = readabilityRequest(xhr, overlay);
    }
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


