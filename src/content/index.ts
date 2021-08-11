import tinykeys from 'tinykeys';
import { browser } from 'webextension-polyfill-ts';
import * as DOMPurify from 'dompurify';

import { FullyFeedlyOptions } from '../fully-feedly-options';
import { FailOverlay, LoadingOverlay, SuccessOverlay } from './overlay';
import { Parser } from './parser/parser';
import { BoilerpipeParser } from './parser/boilerpipe-parser';
import { MercuryParser } from './parser/mercury-parser';

class ContentScript {
    /* ===================== Options ===================== */
    private options: FullyFeedlyOptions = {
        extractionAPI: 'Mercury',
        enableShortcut: false
    };
    private articlePreviewHtml: string = '';

    public init() {
        browser.runtime.onMessage.addListener(this.messageReceived);
        this.restoreOptions();

        this.setupMutationObserver();

        tinykeys(window, {
            'f f': () => {
                if (this.options.enableShortcut) {
                    if (
                        document.querySelector('.showFullArticleBtn') !== null
                    ) {
                        this.fetchPageContent();
                    } else if (
                        document.querySelector('.showArticlePreviewBtn') !==
                        null
                    ) {
                        this.getShowPreviewFunction(this.articlePreviewHtml)();
                    }
                }
            }
        });
    }

    public messageReceived(message) {
        if (message.hasOwnProperty('reloadOptions')) {
            this.restoreOptions();
        } else if (message.text && message.text === 'extract_article') {
            // Check if the operation is allowed
            if (document.querySelector('.showFullArticleBtn') !== null) {
                this.fetchPageContent();
            }
        }
    }

    // Restores the options using the preferences stored in browser.storage.
    public async restoreOptions() {
        try {
            const items = (await browser.storage.sync.get(
                this.options
            )) as FullyFeedlyOptions;
            this.options = items;
            console.log('[FullyFeedly] Loaded options: ', this.options);
        } catch (reason) {
            console.log('[FullyFeedly] Failed to load options: ', reason);
        }
    }

    setupMutationObserver() {
        // This is used to add the button to the article when its
        // preview is opened in Feedly
        const observer = new MutationObserver((mutations) => {
            if (
                mutations[0].addedNodes.length > 0 ||
                mutations[0].removedNodes.length > 0
            ) {
                // Check if the button is already there otherwise add it
                if (
                    document.querySelector('.showFullArticleBtn') !== null ||
                    document.querySelector('.showArticlePreviewBtn') !== null
                ) {
                    return;
                }
                this.addShowFullArticleBtn();
            }
        });
        // Have the observer observe foo for changes in children
        observer.observe(document.getElementById('box'), {
            childList: true,
            subtree: true
        });
    }

    /* ===================== Buttons management  ===================== */
    public addButton(btnText, btnClass, btnAction, deleteBtnClass) {
        // Search the button to open the website and the container element
        const openWebsiteBtn = document.querySelector('.visitWebsiteButton');

        if (openWebsiteBtn === null) {
            return;
        }

        if (openWebsiteBtn.className.indexOf('websiteCallForAction') === -1) {
            openWebsiteBtn.className += ' websiteCallForAction';
        }

        // Create a new button used to load the article
        const newButton = openWebsiteBtn.cloneNode() as HTMLButtonElement;
        newButton.className = btnClass;
        newButton.innerText = btnText;

        // Remove the link and assign a different action
        newButton.removeAttribute('href');
        newButton.onclick = () => {
            btnAction();
        };

        // Add the new button to the page
        openWebsiteBtn.parentElement.insertBefore(newButton, openWebsiteBtn);

        // Remove the old button
        const oldButton = document.querySelector('.' + deleteBtnClass);
        if (oldButton !== null) {
            oldButton.parentNode.removeChild(oldButton);
        }
    }

    public addShowFullArticleBtn() {
        this.addButton(
            browser.i18n.getMessage('showFullArticle'),
            'showFullArticleBtn EntryImpl__button EntryImpl__button--full LinkButton LinkButton--default LinkButton--secondary LinkButton--secondary--default LinkButton--normal EntryImpl__button EntryImpl__button--full',
            () => {
                this.fetchPageContent();
            },
            'showArticlePreviewBtn'
        );
    }

    public addShowArticlePreviewBtn(showPreviewFunction: () => void) {
        this.addButton(
            browser.i18n.getMessage('showArticlePreview'),
            'showArticlePreviewBtn EntryImpl__button EntryImpl__button--full LinkButton LinkButton--default LinkButton--secondary LinkButton--secondary--default LinkButton--normal EntryImpl__button EntryImpl__button--full',
            showPreviewFunction,
            'showFullArticleBtn'
        );
    }

    async fetchPageContent(): Promise<void> {
        // Search the link of the article that is currently opened
        const linkElement = document.querySelector('.websiteCallForAction');
        if (linkElement === null) {
            console.log('[FullyFeedly] Link to article not found');
            new FailOverlay('articleNotFound').showOverlay();
            return;
        }

        // Get the link and convert it for usage as parameter in the GET request
        const pageUrl = linkElement.getAttribute('href');

        // Show loading overlay
        const overlay = new LoadingOverlay().showOverlay();

        let parser: Parser;

        // Select the API to use to extract the article
        if (this.options.extractionAPI === 'Boilerpipe') {
            parser = new BoilerpipeParser(pageUrl, overlay);
        } else if (this.options.extractionAPI === 'Mercury') {
            parser = new MercuryParser(pageUrl, overlay);
        } else {
            new FailOverlay('InvalidAPI', overlay).showOverlay();
            return;
        }

        try {
            const articleContent = await parser.fetchArticleText();
            const cleanArticleContent = DOMPurify.sanitize(articleContent);

            // Search the element of the page that will containt the text
            const contentElement = document.querySelector(
                '.entryBody .content'
            );
            if (contentElement === null) {
                console.log(
                    '[FullyFeedly] There is something wrong: no content element found'
                );
                new FailOverlay('contentNotFound', overlay).showOverlay();
                return;
            }

            // If there is an image we want to keep it
            let articleImage: HTMLImageElement = contentElement.querySelector(
                'img'
            );
            if (articleImage !== null) {
                articleImage = articleImage.cloneNode() as HTMLImageElement;
            }

            // Replace the preview of the article with the full text
            this.articlePreviewHtml = contentElement.innerHTML;
            contentElement.innerHTML = cleanArticleContent;

            // Clear image styles to fix formatting of images with class/style/width information in article markup
            Array.prototype.slice
                .call(contentElement.querySelectorAll('img'))
                .forEach((el) => {
                    el.removeAttribute('class');
                    el.removeAttribute('width');
                    el.setAttribute('style', 'max-width:100%;');
                });

            // Toggle success overlay
            new SuccessOverlay('done', overlay).showOverlay();

            // Put the image back at the beginning of the article
            if (
                articleImage !== null &&
                contentElement.querySelector('img') === null
            ) {
                contentElement.insertBefore(
                    articleImage,
                    contentElement.firstChild
                );
            }

            this.addUndoButton(this.articlePreviewHtml);
        } catch (error) {
            new FailOverlay(error, overlay).showOverlay();
        }
    }

    /* ===================== Show Article Preview ===================== */

    getShowPreviewFunction(articlePreviewHTML) {
        return () => {
            // Search the element with the content
            const contentElement = document.querySelector(
                '.entryBody .content'
            );
            if (contentElement === null) {
                console.log(
                    '[FullyFeedly] There is something wrong: no content element found'
                );
                new FailOverlay('error').showOverlay();
                return;
            }

            // Replace the preview of the article with the full text
            contentElement.innerHTML = articlePreviewHTML;
            this.addShowFullArticleBtn();
            new SuccessOverlay('done').showOverlay();
        };
    }

    // Add a button to undo the operation and show the original preview of the article
    addUndoButton(articlePreviewHTML) {
        this.addShowArticlePreviewBtn(
            this.getShowPreviewFunction(articlePreviewHTML)
        );
    }
}

const content = new ContentScript();
content.init();

export default content;
