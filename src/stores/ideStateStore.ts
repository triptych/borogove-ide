import { observable, action } from "mobx";
import uuid from "uuid/v4";

import { TabStore } from "./tabStore";


/**
 * This store contains the UI state of the IDE.
 */
class IDEStateStore {
    // Currently active pane (left or right), used for determining which pane
    // is shown in the mobile view
    @observable activePane: TabStore;

    // Is the file manager visible?
    @observable fileManagerOpen = true;

    // We'll remember if a wider than mobile screen has been triggered,
    // to avoid re-rendering components when window size changes which would
    // e.g. restart the interpreter
    @observable wideScreenExists = false;

    // The id for the current session, which is used to optimize space
    // on the server (previous compilations can be removed faster if we know
    // that they were made with the same IDE instance.)
    // The id is regenerated every time the page reloads.
    readonly sessionId = uuid().split( "-" ).join( "" );

    @observable currentlyOpenModal: string | null = null;
    @observable modalProps: any;  // eslint-disable-line

    @action public closeModal = (): void => {
        this.currentlyOpenModal = null;
        this.modalProps = {};
    }

    @action public openModal = ( name: string, props?: any ): void => {  // eslint-disable-line
        this.modalProps = props;
        this.currentlyOpenModal = name;
    }

    @action public setActivePane = ( pane: TabStore ): void => {
        this.activePane = pane;
    }

    @action public setWideScreenExists = ( status: boolean ): void => {
        if( this.wideScreenExists !== status ) {
            this.wideScreenExists = status;
        }
    }
}

export default new IDEStateStore();