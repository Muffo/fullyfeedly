'use strict';

browser.runtime.onInstalled.addListener(function(details) {
    console.log(
        'FullyFeedly installed: previousVersion',
        details.previousVersion
    );
});

function printResponse(response) {
    console.log('Content response:\n' + response);
}

/* Regex-pattern to check URLs against.
   It matches URLs like: http[s]://[...]feedly.com[...] */
var urlRegex = /^https?:\/\/(?:[^.]+\.)?feedly\.com/;

browser.tabs.onUpdated.addListener(function(tabId, changeInfo) {
    if (!changeInfo.url) {
        return;
    }
    if (urlRegex.test(changeInfo.url)) {
        browser.pageAction.show(tabId);
    } else {
        browser.pageAction.hide(tabId);
    }
});

// When the browser-action button is clicked...
browser.pageAction.onClicked.addListener(function(tab) {
    // ...check the URL of the active tab against our pattern and...
    if (urlRegex.test(tab.url)) {
        // ...if it matches, send a message specifying a callback too
        browser.tabs
            .sendMessage(tab.id, { text: 'extract_article' })
            .then(printResponse);
    }
});

browser.runtime.onMessage.addListener(function(message, sender) {
    return new Promise(function(resolve, reject) {
        if (message.hasOwnProperty('optionsUpdated')) {
            browser.tabs
                .query({
                    url: '*://*.feedly.com/*'
                })
                .then(function(tabs) {
                    for (var i = 0; i < tabs.length; i++) {
                        var tab = tabs[i];
                        browser.tabs
                            .sendMessage(tab.id, {
                                reloadOptions: true
                            })
                            .then(function() {});
                    }
                })
                .catch(function(error) {
                    console.log(
                        '[FullyFeedly] Error reloading options on tabs: ',
                        error
                    );
                });
        }
        resolve('done');
    });
});

console.log('FullyFeedly: extension started');
