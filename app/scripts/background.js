'use strict';

chrome.runtime.onInstalled.addListener(function (details) {
    console.log('previousVersion', details.previousVersion);
});

/* Regex-pattern to check URLs against. 
   It matches URLs like: http[s]://[...]feedly.com[...] */
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
    if (!urlRegex.test(tab.url)) {
        chrome.pageAction.hide(tabId);
        return;
    }
    
    chrome.pageAction.show(tabId);
});

console.log('\'Allo \'Allo! Event Page for Page Action');
