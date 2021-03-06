import { InterpreterIdentifier } from "services/interpreters/interpreterService";
import { loadRemoteLibraryFiles } from "services/remoteAssets/libraryLoaderService";
import { setProjectTags, pageView } from "services/loggers";
import { restoreFS } from "services/filesystem/persistentFilesystemService";

import editorStateStore from "stores/editorStateStore";
import materialsStore from "stores/materialsStore";
import projectStore, { ProjectStoreState } from "stores/projectStore";

import ProjectTemplate from "./ProjectTemplate.class";
import { MaterialsFileType } from "types/enum";
import ideStateStore from "stores/ideStateStore";


/**
 * The project service which defines and sets up a project
 */
export default abstract class ProjectService {
    // The function that compiles the project
    public abstract compile: ( variant: CompilationVariant ) => Promise<boolean>;

    // The internal id of the project type. Shown in the URL.
    public abstract id: string;

    // Which interpreter the project uses
    public abstract interpreter: InterpreterIdentifier;

    // The name of the programming language. This should match the Monaco editor
    // language names (see editorStateStore).
    public abstract language: string;

    // The name of the project. This is shown as the title in the New Project page.
    public abstract name: string;

    // The type of the compilation report. This is "simple" for everything else
    // other than Inform 7 which uses reporting that tells the status of each
    // stage of the compilation.
    public compilerReportType: "staged" | "simple" = "simple";

    // Should the file manager be initially open?
    public fileManagerStartsOpen = true;

    // Project-specific settings page
    public projectSettingsPage?: JSX.Element;

    // Should the filesystem show compiler options (setting main entry point and include paths)
    public showFilesystemCompilerOptions = true;

    // The optional subtitle shown on the New Project page below the title
    public subtitle?: string;

    // Language-specific settings page
    public systemSettingsPage?: JSX.Element;

    // Project templates (see ProjectTemplate.class.ts).
    // There should be at least one template here.
    public templates: ProjectTemplate[] = [];

    // The contents of the welcome page that opens when the project has been started.
    public welcomePage?: React.FC;

    // Options passed to the compiler, debug and release variants separately
    public compilerOptions?: {
        [key in CompilationVariant]: string[];
    };

    // Virtual paths to pass to the compiler as search paths
    public includePaths?: string[];


    /**
     * Adds the template's initial files to the project
     */
    protected addFiles( files: ( MaterialsFile & { contents?: string })[] ): void {
        files.forEach( ( file: MaterialsFile & { contents?: string }, index: number ) => {
            if( file.type === MaterialsFileType.folder ) {
                materialsStore.addFolder( file.name );
            }
            else {
                const thisFile = materialsStore.addMaterialsFile( file.contents || "", file );

                // Open the first file in the editor and make it the entry file
                if( index === 0 ) {
                    materialsStore.openFile( thisFile );
                    projectStore.setEntryFile( thisFile );
                }
            }
        });
    }

    protected async init( template?: ProjectTemplate ): Promise<boolean> {
        projectStore.setState( ProjectStoreState.loading );
        projectStore.setManager( this );

        // save project metadata to error logging
        setProjectTags( this );

        // mark this as a page view
        pageView( "/ide/" + this.id );

        // hide the file manager if it shouldn't be open at the start
        if( !this.fileManagerStartsOpen ) {
            ideStateStore.fileManagerOpen = false;
        }

        if( template ) {
            return await this.initTemplate( template );
        }
        else {
            return await this.restoreProject();
        }
    }


    /**
     * Project initialization common for all projects.
     * Return true if files were loaded successfully, otherwise false.
     */
    protected async initTemplate( template: ProjectTemplate ): Promise<boolean> {
        if( template.initialCursorPosition ) {
            editorStateStore.initialCursorPosition = template.initialCursorPosition;
        }

        this.addFiles( template.files );

        if( template.remoteAssets && template.remoteAssets.length > 0 ) {
            try {
                await Promise.all( template.remoteAssets.map( resource => ( typeof resource === "string" )
                    ? loadRemoteLibraryFiles( resource, "manifest.json" )
                    : loadRemoteLibraryFiles( resource.url, resource.manifest )
                ) );
            }
            catch( e ) {
                console.log( e );
                return false;
            }
        }

        return true;
    }


    /**
     * The function that initializes the project when the user has chosen it
     */
    public initProject = async ( template?: ProjectTemplate ): Promise<void> => {
        const status = await this.init( template );

        if( status ) {
            projectStore.setReady();
        }
        else {
            projectStore.setState( ProjectStoreState.error );
        }
    };


    /**
     * Restores a saved project
     */
    protected restoreProject = async(): Promise<boolean> => {
        try {
            await restoreFS( this.id );
            return true;
        }
        catch( e ) {
            console.log( e );
            return false;
        }
    }
}
