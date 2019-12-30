import { browser } from 'webextension-polyfill-ts';

import { GenericOverlay } from './generic-overlay';

export class FailOverlay extends GenericOverlay {
    constructor(message, overlay = null) {
        super(
            browser.i18n.getMessage(message),
            browser.extension.getURL('img/cross.png'),
            2e3,
            overlay
        );
    }
}
