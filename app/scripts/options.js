'use strict';

// Saves options to chrome.storage
function saveOptions() {
    var extractionAPI = document.getElementById('extractionAPI').value;
    var readabilityAPIKey = document.getElementById('readabilityAPIKey').value;
    chrome.storage.sync.set({
        extractionAPI: extractionAPI,
        readabilityAPIKey: readabilityAPIKey
    }, function() {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function() {
            status.textContent = '';
        }, 2000);
    });
}

// Restores the options using the preferences stored in chrome.storage.
function restoreOptions() {
    // Use default value extractionAPI = 'red' and readabilityAPIKey = ''
    chrome.storage.sync.get({
        extractionAPI: 'Boilerpipe',
        readabilityAPIKey: ''
    }, function(items) {
        document.getElementById('extractionAPI').value = items.extractionAPI;
        document.getElementById('readabilityAPIKey').value = items.readabilityAPIKey;
    });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
