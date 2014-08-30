'use strict';

if (typeof String.prototype.startsWith !== 'function') {
    // see below for better implementation!
    String.prototype.startsWith = function (str) {
        return this.indexOf(str) === 0;
    };
}


chrome.runtime.onInstalled.addListener(function (details) {
    console.log('previousVersion', details.previousVersion);
});

/* Regex-pattern to check URLs against. 
   It matches URLs like: http[s]://[...]stackoverflow.com[...] */
var urlRegex = /^https?:\/\/(?:[^\.]+\.)?feedly\.com/;

/* A function creator for callbacks */
function doStuffWithDOM(domContent) {
    console.log('I received the following DOM content:\n' + domContent);
}

/* When the browser-action button is clicked... */
chrome.pageAction.onClicked.addListener(function(tab) {
    /*...check the URL of the active tab against our pattern and... */
    if (urlRegex.test(tab.url)) {
        /* ...if it matches, send a message specifying a callback too */
        chrome.tabs.sendMessage(tab.id, { text: 'report_back' }, doStuffWithDOM);
    }
});

chrome.tabs.onUpdated.addListener(function (tabId, tabChange, tab) {
    console.log(tab);
    console.log(tab.url);
    if (!tab.url.startsWith('http://feedly.com/')) {
        chrome.pageAction.hide(tabId);
        return;
    }
    
    chrome.pageAction.show(tabId);
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

    var observer = new MutationObserver(function(mutations, observer) {
        // fired when a mutation occurs
        console.log(mutations, observer);
        // ...
    });

    console.log('Observing document: ', document);
    // define what element should be observed by the observer
    // and what types of mutations trigger the callback
    observer.observe(document, {
        subtree: true,
        attributes: true,
        childList: true
        //...
    });
});

console.log('\'Allo \'Allo! Event Page for Page Action');
