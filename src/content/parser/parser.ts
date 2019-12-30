import { browser } from 'webextension-polyfill-ts';

import { FailOverlay, GenericOverlay } from '../overlay';

export abstract class Parser {
    public requestUrl: string;
    public overlay: GenericOverlay;

    constructor(url: string, overlay: GenericOverlay) {
        this.requestUrl = url;
    }

    abstract extractArticleText(data: any): string;
    abstract getResponseError(response: Response): string;

    async fetchArticleText(): Promise<string> {
        try {
            const response = await fetch(this.requestUrl);
            const data = await response.json();
            return this.extractArticleText(data);
        } catch (response) {
            const message = this.getResponseError(response);
            throw message;
        }
    }

    getGenericError(): string {
        console.log('[FullyFeedly] Failed to load the content of the page');
        return browser.i18n.getMessage('articleNotFound');
    }
}
