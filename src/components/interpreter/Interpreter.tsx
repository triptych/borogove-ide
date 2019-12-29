import React, { SyntheticEvent } from "react";
import { MaterialsFileType } from "types/enum";

import compilationResultStore from "stores/compilationResultStore";
import materialsStore from "stores/materialsStore";
import projectStore from "stores/projectStore";

import { readFile } from "services/filesystem/localFilesystemService";

const REMOTE_URL = process.env.REACT_APP_REMOTE_ASSETS_URL;

/**
 * Loads and runs an interpreter with the latest compiled story file.
 * The interpreter prop is the name of the interpreter to use.
 */
const Interpreter: React.FC = () => {
    const { storyfileLocalPath, storyfileRemoteUrl } = compilationResultStore;

    // send story files and materials to the interpreter
    const sendFiles = function( e: SyntheticEvent<HTMLIFrameElement> ): void {
        const contentWindow = e.currentTarget.contentWindow;
        const storydata = storyfileLocalPath && compilationResultStore.getBase64Storyfile();

        // send the story file
        ( contentWindow as any ).postMessage({  // eslint-disable-line
            action: "start",
            storydata
        }, REMOTE_URL );

        // send the materials
        materialsStore.files
            .filter( materialsFile => materialsFile.type !== MaterialsFileType.folder )
            .forEach( ( materialsFile: MaterialsFile ) => {
                if( materialsFile.type === MaterialsFileType.folder ) {
                    return;
                }

                const path = materialsStore.getPath( materialsFile ).substr( 1 );
                const content = readFile( materialsStore.getFilesystemPath( materialsFile ), true );

                ( contentWindow as any ).postMessage({  // eslint-disable-line
                    action: "fileupload",
                    path,
                    content
                }, REMOTE_URL );
            });
    };

    if( !storyfileLocalPath && !storyfileRemoteUrl ) {
        // neither remote URL nor a file in local filesystem was given,
        // can't do anything because we don't know what game to load
        // TODO error message?
        return null;
    }

    const fullUrl = projectStore.interpreterUrl( storyfileRemoteUrl );

    return <iframe src={fullUrl} id="interpreter-iframe" onLoad={sendFiles}></iframe>;
};

export default Interpreter;