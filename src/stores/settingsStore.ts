import { observable, action } from "mobx";

const SETTINGS_KEY = "borogove.settings";

/**
 * User-defined settings
 */
class SettingsStore {
    @observable compilerOptions: string[] = [];
    @observable settings: AppSettings;

    constructor() {
        const storageContents = localStorage.getItem( SETTINGS_KEY );
        let settings: any = {}; // eslint-disable-line

        try {
            if( storageContents ) {
                settings = JSON.parse( storageContents ) || {};
            }
        }
        catch( e ) {
            // do nothing
        }

        // the ...settings.<foo> overwrites defaults with saved preferences if they exist
        this.settings = {
            editor: {
                fontFamily: "monospace",
                fontSize: 14,
                lineNumbers: true,
                minimap: true,
                wordBasedSuggestions: true,
                showSettingsInfo: true,
                wordWrap: true,
                wrappingIndent: true,
                ...settings.editor
            },
            filesystem: {
                askBeforeOverwrite: true,
                ...settings.filesystem
            },
            logging: {
                analytics: !this.hasDoNotTrack(),
                errors: !this.hasDoNotTrack(),
                ...settings.logging
            },
            transient: {
                showLoggingNotification: true,
                ...settings.transient
            }
        };
    }

    /**
     * Gets the current value of a setting
     */
    public getSetting = ( scope: keyof AppSettings, setting: string ): any => {    // eslint-disable-line
        return this.settings[scope][setting];
    }

    /**
     * Checks if the browser has a "do not track" option set on
     */
    private hasDoNotTrack = (): boolean => {
        return navigator.doNotTrack === "1";
    }

    /**
     * Save settings to localstorage
     */
    private persistSettings = (): void => {
        localStorage.setItem( SETTINGS_KEY, JSON.stringify( this.settings ) );
    };

    /**
     * Sets and saves a setting
     */
    @action public saveSetting = ( scope: keyof AppSettings, setting: string, value: any ): void => {    // eslint-disable-line
        this.settings[scope][setting] = value;
        this.persistSettings();
    }
}

export default new SettingsStore();