import { browser } from 'webextension-polyfill-ts';

import { FailOverlay, GenericOverlay } from '../overlay';
import { Parser } from './parser';

export class BoilerpipeParser extends Parser {
    constructor(url: string, overlay: GenericOverlay) {
        const encodedUrl = encodeURIComponent(url);
        const boilerpipeUrl = `https://boilerpipe-web.appspot.com/extract?url=${encodedUrl}&extractor=ArticleExtractor&output=json&extractImages=`;
        super(boilerpipeUrl, overlay);
    }

    public extractArticleText(data: any): string {
        // Check if the API failed to extract the text
        if (data.status === null || data.status !== 'success') {
            throw false;
        }

        // Get the content of the article
        const articleContent = data.response.content;

        return articleContent;
    }

    public getResponseError(response: Response): string {
        if (response.status === 503) {
            console.log('[FullyFeedly] Boilerpipe API exceeded quota');
            return 'Boilerpipe API exceeded quota';
        } else {
            return this.getGenericError();
        }
    }
}
