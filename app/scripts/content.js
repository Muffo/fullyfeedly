'use strict';

/* Listen for messages */
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    /* If the received message has the expected format... */
    if (msg.text && (msg.text === 'report_back')) {
        /* Call the specified callback, passing 
           the web-pages DOM content as argument */
        sendResponse(document.all[0].outerHTML);
    }
});
