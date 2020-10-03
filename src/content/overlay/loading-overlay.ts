import { Spinner } from 'spin.js';
import { browser } from 'webextension-polyfill-ts';

import { Overlay } from './overlay';

declare const iosOverlay: any;

export class LoadingOverlay implements Overlay {
    // Spinner options
    spinOpts = {
        lines: 13, // The number of lines to draw
        length: 11, // The length of each line
        width: 5, // The line thickness
        radius: 17, // The radius of the inner circle
        corners: 1, // Corner roundness (0..1)
        rotate: 0, // The rotation offset
        color: '#FFF', // #rgb or #rrggbb
        speed: 1, // Rounds per second
        trail: 60, // Afterglow percentage
        shadow: false, // Whether to render a shadow
        hwaccel: false, // Whether to use hardware acceleration
        className: 'spinner', // The CSS class to assign to the spinner
        zIndex: 2e9, // The z-index (defaults to 2000000000)
        top: '50vh', // Top position relative to parent in px
        left: '50vw' // Left position relative to parent in px
    };

    public showOverlay() {
        // Create the spinner and the overlay
        const target = document.createElement('div');
        document.body.appendChild(target);
        const spinner = new Spinner(this.spinOpts).spin(target);
        const overlay = iosOverlay({
            text: browser.i18n.getMessage('loading'),
            spinner
        });

        return overlay;
    }
}
