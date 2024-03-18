import React from 'react';
import { EditorProps } from './Editor.types';
declare const ReactEditor: React.FC<EditorProps>;
export declare const uploaderConfig: (apiUrl: string | undefined, imageUrl: string | undefined) => {
    imagesExtensions: string[];
    filesVariableName: (t: number) => string;
    url: string | undefined;
    withCredentials: boolean;
    format: string;
    method: string;
    prepareData: (formdata: FormData) => FormData;
    isSuccess: (this: any, e: any) => boolean;
    getMessage: (e: any) => string;
    process: (resp: any) => {
        files: any[];
        error: string;
        msg: string;
    };
    error: (this: any, e: Error) => void;
    defaultHandlerError: (this: any, e: any) => void;
};
export declare const config: (includeUploader?: boolean | undefined, apiUrl?: string | undefined, imageUrl?: string | undefined) => {
    readonly: boolean;
    placeholder: string;
    toolbarAdaptive: boolean;
    useSearch: boolean;
    language: string;
    allowResizeX: boolean;
    allowResizeY: boolean;
    height: number;
    enableDragAndDropFileToEditor: boolean;
    showCharsCounter: boolean;
    showWordsCounter: boolean;
    showXPathInStatusbar: boolean;
    buttons: string[];
    uploader: {
        imagesExtensions: string[];
        filesVariableName: (t: number) => string;
        url: string | undefined;
        withCredentials: boolean;
        format: string;
        method: string;
        prepareData: (formdata: FormData) => FormData;
        isSuccess: (this: any, e: any) => boolean;
        getMessage: (e: any) => string;
        process: (resp: any) => {
            files: any[];
            error: string;
            msg: string;
        };
        error: (this: any, e: Error) => void;
        defaultHandlerError: (this: any, e: any) => void;
    } | undefined;
};
export default ReactEditor;
