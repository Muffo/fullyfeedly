/*global $:false */

'use strict';

// Update the form showing the optional fields
function updateForm() {
    var extractionAPI = $('#extractionAPI').val();

    if (extractionAPI === 'Readability') {
        $('#readabilityKeyForm').show();
    }
    else {
        $('#readabilityKeyForm').hide();
    }
}

// Saves options to chrome.storage
function saveOptions() {
    var extractionAPI = $('#extractionAPI').val();
    var readabilityAPIKey = $('#readabilityAPIKey').val();
    var status = $('#status');

    // Check optional paramenters
    if (extractionAPI === 'Readability') {
        if (readabilityAPIKey === '') {
            // Show the error message
            status.text('Missing Readability API key');
            $('#readabilityKeyForm').addClass('has-error');
            setTimeout(function() {
                status.text('');
                $('#readabilityKeyForm').removeClass('has-error');
            }, 2000);
            return;
        }
    }

    chrome.storage.sync.set({
        extractionAPI: extractionAPI,
        readabilityAPIKey: readabilityAPIKey
    }, function() {
        // Update status to let user know options were saved.
        status.text('Options saved');
        setTimeout(function() {
            status.text('');
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
        $('#extractionAPI').val(items.extractionAPI);
        $('#readabilityAPIKey').val(items.readabilityAPIKey);
        updateForm();
    });
}


document.addEventListener('DOMContentLoaded', restoreOptions);
$('#save').click(saveOptions);
$('#extractionAPI').change(updateForm);
