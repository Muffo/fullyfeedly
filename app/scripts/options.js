/*global $:false, Mousetrap:false */

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

    if (extractionAPI === 'Mercury') {
        $('#mercuryKeyForm').show();
    }
    else {
        $('#mercuryKeyForm').hide();
    }
}

// Show a visual confirmation to the user
function onKeyboardShortcut() {
    $('#tryShortcut').css('background-color', '#5cb85c');
    setTimeout(function() {
        $('#tryShortcut').css('background-color', 'white');
    }, 500);
}

// Saves options to chrome.storage
function saveOptions() {
    var extractionAPI = $('#extractionAPI').val();
    var readabilityAPIKey = $('#readabilityAPIKey').val();
    var mercuryAPIKey = $('#mercuryAPIKey').val();
    var enableShortcut = $('#enableShortcut').prop('checked');
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
    if (extractionAPI === 'Mercury') {
        if (mercuryAPIKey === '') {
            // Show the error message
            status.text('Missing Mercury API key');
            $('#mercuryKeyForm').addClass('has-error');
            setTimeout(function() {
                status.text('');
                $('#mercuryKeyForm').removeClass('has-error');
            }, 2000);
            return;
        }
    }

    chrome.storage.sync.set({
        extractionAPI: extractionAPI,
        readabilityAPIKey: readabilityAPIKey,
        mercuryAPIKey: mercuryAPIKey,
        enableShortcut: enableShortcut
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
        readabilityAPIKey: '',
        mercuryAPIKey: '',
        enableShortcut: false
    }, function(items) {
        $('#extractionAPI').val(items.extractionAPI);
        $('#readabilityAPIKey').val(items.readabilityAPIKey);
        $('#mercuryAPIKey').val(items.mercuryAPIKey);
        $('#enableShortcut').prop('checked', items.enableShortcut);
        updateForm();
    });
}

function translateOptions() {
  var objects = document.getElementsByTagName('*'), i;
  for(i = 0; i < objects.length; i++) {
    if (objects[i].dataset && objects[i].dataset.message) {
      var html = chrome.i18n.getMessage(objects[i].dataset.message);
      if (html) {
          objects[i].innerHTML = chrome.i18n.getMessage(objects[i].dataset.message);
      }
    }
  }
}
document.addEventListener('DOMContentLoaded', restoreOptions);
document.addEventListener('DOMContentLoaded', translateOptions);
$('#save').click(saveOptions);
$('#extractionAPI').change(updateForm);

Mousetrap.bind('f f', onKeyboardShortcut);
