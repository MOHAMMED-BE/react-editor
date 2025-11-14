import React from 'react';
import { EditorProps } from './Editor.types';
declare const ReactEditor: React.FC<EditorProps>;
export declare const uploaderConfig: (apiUrl?: string, imageUrl?: string) => {
    imagesExtensions: string[];
    filesVariableName(t: number): string;
    url: string | undefined;
    withCredentials: boolean;
    format: string;
    method: string;
    prepareData(formdata: FormData): FormData;
    isSuccess(this: any, e: any): boolean;
    getMessage(e: any): string;
    process(resp: any): {
        files: any[];
        error: string;
        msg: string;
    };
    error(this: any, e: Error): void;
    defaultHandlerError(this: any, e: any): void;
};
type ConfigParams = {
    includeUploader?: boolean;
    apiUrl?: string;
    imageUrl?: string;
    onDeleteImage?: (imageUrl: string) => void | Promise<void>;
};
export declare const config: ({ includeUploader, apiUrl, imageUrl, onDeleteImage, }?: ConfigParams) => any;
export default ReactEditor;
