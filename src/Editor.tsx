import React from 'react';
import JoditEditor from 'jodit-react';
import { EditorProps } from './Editor.types';

const ReactEditor: React.FC<EditorProps> = ({ onChange, onBlur, value, config }) => {
    return (
        <JoditEditor
            value={value}
            config={config}
            onBlur={onBlur}
            onChange={onChange}
        />
    );
};

/**
 * Uploader configuration for Jodit
 * Handles image upload + insertion in the editor
 */
export const uploaderConfig = (
    apiUrl?: string,
    imageUrl?: string
) => ({
    imagesExtensions: ['jpg', 'png', 'jpeg', 'gif', 'webp'],
    filesVariableName(t: number): string {
        return 'files[' + t + ']';
    },
    url: apiUrl,
    withCredentials: false,
    format: 'json',
    method: 'POST',
    prepareData(formdata: FormData): FormData {
        return formdata;
    },
    isSuccess(this: any, e: any): boolean {
        const fn = this.jodit;

        if (e?.data?.files && e.data.files.length) {
            const tagName = 'img';

            e.data.files.forEach((filename: string) => {
                const elm = fn.createInside.element(tagName);
                const src = imageUrl ? `${imageUrl}/${filename}` : filename;
                elm.setAttribute('src', src);
                fn.s.insertImage(elm as HTMLImageElement, null, fn.o.imageDefaultWidth);
            });
        }

        return !!e?.success;
    },
    getMessage(e: any): string {
        return e?.data?.messages && Array.isArray(e.data.messages)
            ? e.data.messages.join('')
            : '';
    },
    process(resp: any): { files: any[]; error: string; msg: string } {
        const files: any[] = [];
        files.unshift(resp?.data);

        return {
            files: resp?.data,
            error: resp?.msg,
            msg: resp?.msg,
        };
    },
    error(this: any, e: Error): void {
        this.j.e.fire('errorMessage', e.message, 'error', 4000);
    },
    defaultHandlerError(this: any, e: any): void {
        this.j.e.fire('errorMessage', e?.message || 'Upload error');
    },
});

type ConfigParams = {
    includeUploader?: boolean;
    apiUrl?: string;
    imageUrl?: string;
    /**
     * Called when an image is really removed from the editor content.
     * You receive the image src URL and can call your API to delete it on server.
     */
    onDeleteImage?: (imageUrl: string) => void | Promise<void>;
};

/**
 * Build Jodit config for ReactEditor
 */
export const config = ({
    includeUploader,
    apiUrl,
    imageUrl,
    onDeleteImage,
}: ConfigParams = {}) => {
    const base: any = {
        readonly: false,
        placeholder: 'Start typing...',
        toolbarAdaptive: false,
        useSearch: false,
        language: 'en',
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
            'image',
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
    };

    if (includeUploader) {
        base.uploader = uploaderConfig(apiUrl, imageUrl);
    }

    if (onDeleteImage) {
        base.events = {
            ...(base.events || {}),
            /**
             * We use the value diff to detect removed <img> src.
             * This avoids false calls during upload (where DOM nodes can be replaced).
             */
            afterInit(editor: any) {
                const extractImageSrcs = (html: string): Set<string> => {
                    const container = document.createElement('div');
                    container.innerHTML = html || '';
                    const imgs = Array.from(container.getElementsByTagName('img')) as HTMLImageElement[];

                    return new Set(
                        imgs
                            .map((img) => img.getAttribute('src') || '')
                            .filter((src) => !!src)
                    );
                };

                let prevValue: string = editor.value || '';
                let prevSrcs: Set<string> = extractImageSrcs(prevValue);

                editor.events.on('change', async () => {
                    const currentValue: string = editor.value || '';
                    const currentSrcs = extractImageSrcs(currentValue);

                    // src present before, not present now -> deleted
                    prevSrcs.forEach((src) => {
                        if (!currentSrcs.has(src)) {
                            // If imageUrl is defined, you can filter to only your own assets
                            if (!imageUrl || src.startsWith(imageUrl)) {
                                void onDeleteImage(src);
                            }
                        }
                    });

                    prevValue = currentValue;
                    prevSrcs = currentSrcs;
                });
            },
        };
    }

    return base;
};

export default ReactEditor;
