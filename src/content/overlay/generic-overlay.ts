import { Overlay } from './overlay';

declare const iosOverlay: any;

export class GenericOverlay implements Overlay {
    public message: string;
    public icon: string;
    public duration: number;
    public overlay: any;

    constructor(message, icon, duration, overlay) {
        this.message = message;
        this.icon = icon;
        this.duration = duration;
        this.overlay = overlay;
    }

    public showOverlay() {
        const settings = {
            text: this.message,
            icon: this.icon
        };

        if (this.overlay === undefined || this.overlay === null) {
            this.overlay = iosOverlay(settings);
        } else {
            this.overlay.update(settings);
        }
        window.setTimeout(() => {
            this.overlay.hide();
        }, this.duration);
    }
}
