/// <reference types="jquery"/>
import tinykeys from "tinykeys";
import { browser } from 'webextension-polyfill-ts';

import { FullyFeedlyOptions } from '../fully-feedly-options';

declare const $: JQueryStatic;

class OptionsScript {
    public init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.restoreOptions();
        });
        document.addEventListener('DOMContentLoaded', () => {
            this.translateOptions();
        });

        $('#save').click(() => {
            this.saveOptions();
        });

        tinykeys(window, {
            'f f': () => {
                this.onKeyboardShortcut();
            }
        });
    }

    // Show a visual confirmation to the user
    public onKeyboardShortcut() {
        $('#tryShortcut').css('background-color', '#5cb85c');
        setTimeout(() => {
            $('#tryShortcut').css('background-color', 'white');
        }, 500);
    }

    // Saves options to browser.storage
    public async saveOptions() {
        const extractionAPI = $('#extractionAPI').val();
        const enableShortcut = $('#enableShortcut').prop('checked');
        const status = $('#status');

        await browser.storage.sync.set({
            extractionAPI,
            enableShortcut
        } as FullyFeedlyOptions);
        // Update status to let user know options were saved.
        status.text('Options saved');
        await browser.runtime.sendMessage({
            optionsUpdated: true
        });

        setTimeout(() => {
            status.text('');
        }, 2000);
    }

    // Restores the options using the preferences stored in browser.storage.
    public async restoreOptions() {
        // Use default value extractionAPI = 'Mercury'
        const items: FullyFeedlyOptions = (await browser.storage.sync.get({
            extractionAPI: 'Mercury',
            enableShortcut: false
        } as FullyFeedlyOptions)) as FullyFeedlyOptions;
        // In case the user has not switched to Mercury yet...
        if (items.extractionAPI === 'Readability') {
            items.extractionAPI = 'Mercury';
        }

        $('#extractionAPI').val(items.extractionAPI);
        $('#enableShortcut').prop('checked', items.enableShortcut);
    }

    public translateOptions() {
        const objects = document.querySelectorAll('[data-message]');
        objects.forEach((object: HTMLElement) => {
            if (object.dataset && object.dataset.message) {
                const html = browser.i18n.getMessage(object.dataset.message);
                if (html) {
                    object.innerHTML = browser.i18n.getMessage(
                        object.dataset.message
                    );
                }
            }
        });
    }
}

$(document).ready(() => {
    const script = new OptionsScript();
    script.init();
});
