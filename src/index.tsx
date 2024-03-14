import { FC, useMemo, useRef } from 'react';
import JoditEditor from "jodit-react";
import React from 'react';

interface EditorProps {
    onChange?: any;
    onBlur?: any;
    value?: any;
    useUploadImage?: boolean;
    apiUrl?: string;
    imageUrl?: string;
}

const ReactEditor: FC<EditorProps> = ({ onChange, onBlur, value, useUploadImage, apiUrl, imageUrl }) => {
    const editor = useRef(null);

    const uploaderConfig = {
        imagesExtensions: ['jpg', 'png', 'jpeg', 'gif', 'webp'],
        filesVariableName: function (t: number): string {
            return 'files[' + t + ']';
        },
        url: apiUrl,
        withCredentials: false,
        format: 'json',
        method: 'POST',
        prepareData: function (formdata: FormData): FormData {
            return formdata;
        },
        isSuccess: function (this: any, e: any): boolean {
            const fn = this.jodit

            if (e.data.files && e.data.files.length) {
                const tagName = 'img';
                e.data.files.forEach((filename: string, index: number) => {
                    const elm = fn.createInside.element(tagName);
                    elm.setAttribute('src', `${imageUrl}/${filename}`);
                    fn.s.insertImage(elm as HTMLImageElement, null, fn.o.imageDefaultWidth);
                });
            }

            return e.success;
        },
        getMessage: function (e: any): string {
            return e.data.messages && Array.isArray(e.data.messages)
                ? e.data.messages.join('')
                : '';
        },
        process: function (resp: any): { files: any[]; error: string; msg: string } {
            let files: any[] = [];
            files.unshift(resp.data);
            return {
                files: resp.data,
                error: resp.msg,
                msg: resp.msg,
            };
        },

        error: function (this: any, e: Error): void {
            this.j.e.fire('errorMessage', e.message, 'error', 4000);
        },

        defaultHandlerError: function (this: any, e: any): void {
            this.j.e.fire('errorMessage', e.message);
        },
    };


    const config = useMemo(
        () => ({
            readonly: false,
            placeholder: 'Start typing...',
            toolbarAdaptive: false,
            useSearch: false,
            language: "en",
            allowResizeX: false,
            allowResizeY: false,
            height: 400,
            enableDragAndDropFileToEditor: true,
            showCharsCounter: true,
            showWordsCounter: true,
            showXPathInStatusbar: false,

            buttons: [
                'source',
                '|',
                'bold',
                'italic',
                'underline',
                '|',
                'ul',
                'ol',
                '|',
                `${useUploadImage ? 'image' : ''}`,
                'file',
                '|',
                'video',
                '|',
                'link',
                '|',
                'undo',
                'redo',
                '|',
                'hr',
                '|',
                'eraser',
                '|',
                'font',
                'fontsize',
                'paragraph',
                'brush',
                '|',
                'table',
                'fullsize',
            ],
            uploader: useUploadImage ? uploaderConfig : undefined,
        }),
        []
    );


    return (
        <JoditEditor
            ref={editor}
            value={value}
            config={config}
            onBlur={onBlur}
            onChange={onChange}
        />
    );
};

export default ReactEditor