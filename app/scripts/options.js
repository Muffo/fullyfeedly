/*global $:false, Mousetrap:false */

'use strict';

// Update the form showing the optional fields
function updateForm() {
    var extractionAPI = $('#extractionAPI').val();

    if (extractionAPI === 'Mercury') {
        $('#mercuryKeyForm').show();
    } else {
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

// Saves options to browser.storage
function saveOptions() {
    var extractionAPI = $('#extractionAPI').val();
    var mercuryAPIKey = $('#mercuryAPIKey').val();
    var enableShortcut = $('#enableShortcut').prop('checked');
    var status = $('#status');

    // Check optional paramenters
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

    browser.storage.sync.set(
        {
            extractionAPI: extractionAPI,
            mercuryAPIKey: mercuryAPIKey,
            enableShortcut: enableShortcut
        },
        function() {
            // Update status to let user know options were saved.
            status.text('Options saved');
            browser.runtime.sendMessage({
                optionsUpdated: true
            });
            setTimeout(function() {
                status.text('');
            }, 2000);
        }
    );
}

// Restores the options using the preferences stored in browser.storage.
function restoreOptions() {
    // Use default value extractionAPI = 'Boilerpipe' and mercuryAPIKey = ''
    browser.storage.sync.get(
        {
            extractionAPI: 'Boilerpipe',
            mercuryAPIKey: '',
            enableShortcut: false
        },
        function(items) {
            // In case the user has not switched to Mercury yet...
            if (items.extractionAPI === 'Readability') {
                items.extractionAPI = 'Boilerpipe';
            }

            $('#extractionAPI').val(items.extractionAPI);
            $('#mercuryAPIKey').val(items.mercuryAPIKey);
            $('#enableShortcut').prop('checked', items.enableShortcut);
            updateForm();
        }
    );
}

function translateOptions() {
    var objects = document.getElementsByTagName('*'),
        i;
    for (i = 0; i < objects.length; i++) {
        if (objects[i].dataset && objects[i].dataset.message) {
            var html = browser.i18n.getMessage(objects[i].dataset.message);
            if (html) {
                objects[i].innerHTML = browser.i18n.getMessage(
                    objects[i].dataset.message
                );
            }
        }
    }
}
document.addEventListener('DOMContentLoaded', restoreOptions);
document.addEventListener('DOMContentLoaded', translateOptions);
$('#save').click(saveOptions);
$('#extractionAPI').change(updateForm);

Mousetrap.bind('f f', onKeyboardShortcut);
