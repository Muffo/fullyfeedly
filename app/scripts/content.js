/*global Spinner:false, iosOverlay:false, Mousetrap:false */
/*jslint latedef:false*/

'use strict';

/* ===================== Options ===================== */
var options = {
    extractionAPI: 'Mercury',
    enableShortcut: false
};

// Restores the options using the preferences stored in browser.storage.
function restoreOptions() {
    var optionsPromise = browser.storage.sync.get(options);
    optionsPromise.then(
        function(items) {
            options = items;
            console.log('[FullyFeedly] Loaded options: ', options);
        },
        function(reason) {
            console.log('[FullyFeedly] Failed to load options: ', reason);
        }
    );
}

(function() {
    browser.runtime.onMessage.addListener(function(message, sender) {
        return new Promise(function(resolve, reject) {
            if (message.hasOwnProperty('reloadOptions')) {
                restoreOptions();
            }
            resolve('done');
        });
    });
    restoreOptions();
})();

/* ===================== Notifications ===================== */
function loadingOverlay() {
    // Spinner options
    var spinOpts = {
        lines: 13, // The number of lines to draw
        length: 11, // The length of each line
        width: 5, // The line thickness
        radius: 17, // The radius of the inner circle
        corners: 1, // Corner roundness (0..1)
        rotate: 0, // The rotation offset
        color: '#FFF', // #rgb or #rrggbb
        speed: 1, // Rounds per second
        trail: 60, // Afterglow percentage
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
        text: browser.i18n.getMessage('loading'),
        spinner: spinner
    });

    return overlay;
}

function genericOverlay(message, icon, duration, overlay) {
    var settings = {
        text: message,
        icon: icon
    };

    if (overlay === undefined || overlay === null) {
        overlay = iosOverlay(settings);
    } else {
        overlay.update(settings);
    }
    window.setTimeout(function() {
        overlay.hide();
    }, duration);
}

function successOverlay(message, overlay) {
    genericOverlay(
        browser.i18n.getMessage(message),
        browser.extension.getURL('images/check.png'),
        1e3,
        overlay
    );
}

function failOverlay(message, overlay) {
    genericOverlay(
        browser.i18n.getMessage(message),
        browser.extension.getURL('images/cross.png'),
        2e3,
        overlay
    );
}

/* ===================== Buttons management  ===================== */
function addButton(btnText, btnClass, btnAction, deleteBtnClass) {
    // Search the button to open the website and the container element
    var openWebsiteBtn = document.querySelector(
        '.u100Entry .fx-button.secondary.full-width'
    );
    var entryElement = document.querySelector('.u100Entry');

    if (openWebsiteBtn === null || entryElement === null) {
        return;
    }

    if (openWebsiteBtn.className.indexOf('websiteCallForAction') === -1) {
        openWebsiteBtn.className += ' websiteCallForAction';
    }

    // Create a new button used to load the article
    var newButton = openWebsiteBtn.cloneNode();
    newButton.className = btnClass;
    newButton.innerText = btnText;

    // Remove the link and assign a different action
    newButton.removeAttribute('href');
    newButton.onclick = btnAction;

    // Add the new button to the page
    entryElement.insertBefore(newButton, openWebsiteBtn);

    // Remove the old button
    var oldButton = document.querySelector('.' + deleteBtnClass);
    if (oldButton === null) {
        return;
    }
    oldButton.parentNode.removeChild(oldButton);
}

function addShowFullArticleBtn() {
    addButton(
        browser.i18n.getMessage('showFullArticle'),
        'showFullArticleBtn fx-button secondary full-width',
        fetchPageContent,
        'showArticlePreviewBtn'
    );

    // Add keyboard shortcut
    if (options.enableShortcut) {
        Mousetrap.bind('f f', fetchPageContent);
    }
}

function addShowArticlePreviewBtn(showPreviewFunction) {
    addButton(
        browser.i18n.getMessage('showArticlePreview'),
        'showArticlePreviewBtn fx-button secondary full-width',
        showPreviewFunction,
        'showFullArticleBtn'
    );

    // Add keyboard shortcut
    if (options.enableShortcut) {
        Mousetrap.bind('f f', showPreviewFunction);
    }
}

/* ===================== Boilerpipe ===================== */
function onBoilerpipeArticleExtracted(data, overlay) {
    // Check if the API failed to extract the text
    if (data.status === null || data.status !== 'success') {
        console.log('[FullyFeedly] API failed to extract the content');
        failOverlay(browser.i18n.getMessage('articleNotLoaded'), overlay);
        return;
    }

    // Get the content of the article
    var articleContent = data.response.content;

    // Search the element of the page that will containt the text
    var contentElement = document.querySelector('.entryBody .content');
    if (contentElement === null) {
        console.log(
            '[FullyFeedly] There is something wrong: no content element found'
        );
        failOverlay('contentNotFound', overlay);
        return;
    }

    // If there is an image we want to keep it
    var articleImage = contentElement.querySelector('img');
    if (articleImage !== null) {
        articleImage = articleImage.cloneNode();
    }

    // Replace the preview of the article with the full text
    var articlePreviewHTML = contentElement.innerHTML;
    contentElement.innerHTML = articleContent;

    // Clear image styles to fix formatting of images with class/style/width information in article markup
    Array.prototype.slice
        .call(contentElement.querySelectorAll('img'))
        .forEach(function(el) {
            el.removeAttribute('class');
            el.removeAttribute('width');
            el.setAttribute('style', 'max-width:100%;');
        });

    // Toggle Success Overlay
    addUndoButton(articlePreviewHTML);
    successOverlay('done', overlay);
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
                failOverlay('APIOverQuota', overlay);
            } else {
                console.log(
                    '[FullyFeedly] Failed to load the content of the page'
                );
                failOverlay(
                    browser.i18n.getMessage('articleNotFound'),
                    overlay
                );
            }
        }
    };
}

/* ===================== Mercury ===================== */
function onMercuryArticleExtracted(data, overlay) {
    // Check if the API failed to extract the text
    if (data.content === null) {
        console.log('[FullyFeedly] Mercury API failed to extract the content');
        failOverlay('articleNotFound', overlay);
        return;
    }

    // Get the content of the article
    var articleContent = data.content;

    // Search the element of the page that will containt the text
    var contentElement = document.querySelector('.entryBody .content');
    if (contentElement === null) {
        console.log(
            '[FullyFeedly] There is something wrong: no content element found'
        );
        failOverlay('contentNotFound', overlay);
        return;
    }

    // If there is an image we want to keep it
    var articleImage = contentElement.querySelector('img');
    if (articleImage !== null) {
        articleImage = articleImage.cloneNode();
    }

    // Replace the preview of the article with the full text
    var articlePreviewHTML = contentElement.innerHTML;
    contentElement.innerHTML = articleContent;

    // Clear image styles to fix formatting of images with class/style/width information in article markup
    Array.prototype.slice
        .call(contentElement.querySelectorAll('img'))
        .forEach(function(el) {
            el.removeAttribute('class');
            el.removeAttribute('width');
            el.setAttribute('style', 'max-width:100%;');
        });

    // Toggle success overlay
    successOverlay('done', overlay);

    // Put the image back at the beginning of the article
    if (articleImage !== null && contentElement.querySelector('img') === null) {
        contentElement.insertBefore(articleImage, contentElement.firstChild);
    }

    addUndoButton(articlePreviewHTML);
}

/* ===================== Mercury ===================== */
function mercuryRequest(xhr, overlay) {
    return function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                // Operation succeded
                var data = JSON.parse(xhr.responseText);
                onMercuryArticleExtracted(data, overlay);
            } else if (xhr.status === 400) {
                console.log(
                    '[FullyFeedly] Mercury API Bad request: ' +
                        'The server could not understand your request. ' +
                        'Verify that request parameters (and content, if any) are valid.'
                );
                failOverlay('APIBadRequest', overlay);
            } else if (xhr.status === 403) {
                console.log(
                    '[FullyFeedly] Mercury API Authorization Required: ' +
                        'Authentication failed or was not provided.'
                );
                failOverlay('APIAuthorizationRequired', overlay);
            } else {
                console.log('[FullyFeedly] Mercury API Unknown error');
                failOverlay('APIUnknownError', overlay);
            }
        }
    };
}

/**
 * Performs an XMLHttpRequest to boilerpipe to get the content of the artile.
 */
function fetchPageContent() {
    // Search the link of the article that is currently opened
    var linkElement = document.querySelector('.websiteCallForAction');
    if (linkElement === null) {
        console.log('[FullyFeedly] Link to article not found');
        failOverlay('articleNotFound');
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

    // Select the API to use to extract the article
    if (options.extractionAPI === 'Boilerpipe') {
        // Prepare the request to Boilerpipe
        url =
            'https://boilerpipe-web.appspot.com/extract?url=' +
            encodedPageUrl +
            '&extractor=ArticleExtractor&output=json&extractImages=';

        xhr.onreadystatechange = boilerpipeRequest(xhr, overlay);
    } else if (options.extractionAPI === 'Mercury') {
        url = 'https://tspqn0587i.execute-api.us-east-1.amazonaws.com/prod/parser?url=' + encodedPageUrl;

        xhr.onreadystatechange = mercuryRequest(xhr, overlay);
    } else {
        failOverlay('InvalidAPI', overlay);
        return;
    }
    xhr.open('GET', url, true);
    xhr.send();
}

/* ===================== Show Article Preview ===================== */

// Add a button to undo the operation and show the original preview of the article
function addUndoButton(articlePreviewHTML) {
    function getShowPreviewFunction(articlePreviewHTML) {
        return function() {
            // Search the element with the content
            var contentElement = document.querySelector('.entryBody .content');
            if (contentElement === null) {
                console.log(
                    '[FullyFeedly] There is something wrong: no content element found'
                );
                failOverlay('error');
                return;
            }

            // Replace the preview of the article with the full text
            contentElement.innerHTML = articlePreviewHTML;
            addShowFullArticleBtn();
            successOverlay('done');
        };
    }
    addShowArticlePreviewBtn(getShowPreviewFunction(articlePreviewHTML));
}

/* ================ DOM Observer =============== */

// Define a generic DOM Observer
var observeDOM = (function() {
    var MutationObserver =
        window.MutationObserver || window.WebKitMutationObserver;
    return function(obj, callback) {
        // Define a new observer
        var obs = new MutationObserver(function(mutations) {
            if (
                mutations[0].addedNodes.length > 0 ||
                mutations[0].removedNodes.length > 0
            ) {
                callback(mutations);
            }
        });
        // Have the observer observe foo for changes in children
        obs.observe(obj, { childList: true, subtree: true });
    };
})();

// This is used to add the button to the article when its
// preview is opened in Feedly
observeDOM(document.getElementById('box'), function() {
    // Check if the button is already there otherwise add it
    if (
        document.querySelector('.showFullArticleBtn') !== null ||
        document.querySelector('.showArticlePreviewBtn') !== null
    ) {
        return;
    }
    addShowFullArticleBtn();
});

// Listen for requests coming from clicks on the page action button
browser.runtime.onMessage.addListener(function(msg, sender) {
    return new Promise(function(resolve, reject) {
        // Process the requests according to the action specified
        if (msg.text && msg.text === 'extract_article') {
            // Check if the operation is allowed
            if (document.querySelector('.showFullArticleBtn') !== null) {
                fetchPageContent();
            }
        }
        resolve('done');
    });
});
