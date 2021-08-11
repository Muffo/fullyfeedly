import { browser } from 'webextension-polyfill-ts';

class BackgroundScript {
    /* Regex-pattern to check URLs against.
    It matches URLs like: http[s]://[...]feedly.com[...] */
//     public urlRegex: RegExp = /^https?:\/\/(?:[^.]+\.)?feedly\.com/;

    public init() {
        browser.runtime.onInstalled.addListener(this.installed);

        browser.tabs.onUpdated.addListener(this.tabUpdated);

        // When the browser-action button is clicked...
        browser.pageAction.onClicked.addListener(this.pageAction);

        browser.runtime.onMessage.addListener(this.messageReceived);
    }

    public printResponse(response) {
        console.log('Content response:\n' + response);
    }

    public installed(details) {
        console.log(
            'FullyFeedly installed: previousVersion',
            details.previousVersion
        );
    }

    public tabUpdated(tabId, changeInfo) {
        const urlRegex: RegExp = /^https?:\/\/(?:[^.]+\.)?feedly\.com/;
        if (!changeInfo.url) {
            return;
        }
        if (urlRegex.test(changeInfo.url)) {
            browser.pageAction.show(tabId);
        } else {
            browser.pageAction.hide(tabId);
        }
    }

    public pageAction(tab) {
        const urlRegex: RegExp = /^https?:\/\/(?:[^.]+\.)?feedly\.com/;
        // ...check the URL of the active tab against our pattern and...
        if (urlRegex.test(tab.url)) {
            // ...if it matches, send a message specifying a callback too
            browser.tabs
                .sendMessage(tab.id, { text: 'extract_article' })
                .then(this.printResponse);
        }
    }

    public async messageReceived(message, sender) {
        try {
            if (message.hasOwnProperty('optionsUpdated')) {
                const tabs = await browser.tabs.query({
                    url: '*://*.feedly.com/*'
                });
                for (const tab of tabs) {
                    browser.tabs.sendMessage(tab.id, {
                        reloadOptions: true
                    });
                }
            }
        } catch (error) {
            console.log(
                '[FullyFeedly] Error reloading options on tabs: ',
                error
            );
        }
    }
}

console.log('FullyFeedly: extension started');

const background = new BackgroundScript();
background.init();

export default background;
