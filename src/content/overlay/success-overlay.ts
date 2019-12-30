import { browser } from 'webextension-polyfill-ts';

import { GenericOverlay } from './generic-overlay';

export class SuccessOverlay extends GenericOverlay {
    constructor(message, overlay = null) {
        super(
            browser.i18n.getMessage(message),
            browser.extension.getURL('img/check.png'),
            1e3,
            overlay
        );
    }
}
