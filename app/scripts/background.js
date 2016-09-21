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
function articleExtractorRequest(xhr, sendResponse) {
    return function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                // Operation succeded
                sendResponse({content:xhr.responseText});
            } else if (xhr.status === 503) {
                console.log('[FullyFeedly] Boilerpipe API exceeded quota');
                sendResponse({error:'APIOverQuota'});
            } else {
                console.log('[FullyFeedly] Failed to load the content of the page');
                sendResponse({error:'articleNotFound'});
            }
        }
    };
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (request.url) {
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = articleExtractorRequest(xhr, sendResponse);
      xhr.open('GET', request.url, true);
      xhr.send();
    }
    return true;
});

console.log('FullyFeedly: extension started');
