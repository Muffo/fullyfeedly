'use strict';

chrome.runtime.onInstalled.addListener(function (details) {
    console.log('FullyFeedly installed: previousVersion', details.previousVersion);
});


function printResponse(response) {
    console.log('Content response:\n' + response);
}

/* Regex-pattern to check URLs against. 
   It matches URLs like: http[s]://[...]feedly.com[...] */
var urlRegex = /^https?:\/\/(?:[^\.]+\.)?feedly\.com/;

// When the browser-action button is clicked...
chrome.pageAction.onClicked.addListener(function(tab) {
    // ...check the URL of the active tab against our pattern and...
    if (urlRegex.test(tab.url)) {
        // ...if it matches, send a message specifying a callback too 
        chrome.tabs.sendMessage(tab.id, { text: 'extract_article' }, printResponse);
    }
});

// When the extension is installed or upgraded ...
chrome.runtime.onInstalled.addListener(function() {
    // Replace all rules ...
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        // With a new rule ...
        chrome.declarativeContent.onPageChanged.addRules([
            {
                // That fires when a page's URL contains a 'feedly.com' ...
                conditions: [
                    new chrome.declarativeContent.PageStateMatcher({
                        pageUrl: { urlContains: 'feedly.com' },
                    })
                ],
                // And shows the extension's page action.
                actions: [ new chrome.declarativeContent.ShowPageAction() ]
            }
        ]);
    });
});

console.log('FullyFeedly: extension started');
