import { FailOverlay, GenericOverlay } from '../overlay';
import { Parser } from './parser';

export class MercuryParser extends Parser {
    constructor(url: string, overlay: GenericOverlay) {
        const encodedUrl = encodeURIComponent(url);
        const mercuryUrl = `https://tspqn0587i.execute-api.us-east-1.amazonaws.com/prod/parser?url=${encodedUrl}`;
        super(mercuryUrl, overlay);
    }

    public extractArticleText(data): string {
        // Check if the API failed to extract the text
        if (data.content === null) {
            throw false;
        }

        // Get the content of the article
        const articleContent = data.content;
        return articleContent;
    }

    /* ===================== Mercury ===================== */
    public getResponseError(response: Response): string {
        if (!response) {
            return this.getGenericError();
        }
        if (response.status === 400) {
            console.log(
                '[FullyFeedly] Mercury API Bad request: ' +
                    'The server could not understand your request. ' +
                    'Verify that request parameters (and content, if any) are valid.'
            );
            return 'Mercury API Bad Request';
        } else if (response.status === 403) {
            console.log(
                '[FullyFeedly] Mercury API Authorization Required: ' +
                    'Authentication failed or was not provided.'
            );
            return 'Mercury API Authorization Required';
        } else {
            return this.getGenericError();
        }
    }
}
