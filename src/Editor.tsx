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

const isImageByExtension = (filename: string, imageExts: string[]): boolean => {
    const clean = (filename || '').split('?')[0]?.split('#')[0] ?? '';
    const ext = (clean.split('.').pop() || '').toLowerCase();
    return !!ext && imageExts.includes(ext);
};

// ✅ UPDATED: for files, display name without extension and without last "-..."
// Example: recu-202600004-2-69956651a3b98099024323.pdf -> recu-202600004-2
const getDisplayNameFromPath = (filename: string): string => {
    const clean = (filename || '').split('?')[0]?.split('#')[0] ?? '';
    const last = clean.split('/').pop();
    const base = last ? decodeURIComponent(last) : filename;

    // remove extension
    const dotIndex = base.lastIndexOf('.');
    const noExt = dotIndex > 0 ? base.slice(0, dotIndex) : base;

    // remove last "-..." suffix
    const dashIndex = noExt.lastIndexOf('-');
    if (dashIndex > 0) {
        return noExt.slice(0, dashIndex);
    }

    return noExt;
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
            e.data.files.forEach((filename: string) => {
                const src = imageUrl ? `${imageUrl}/${filename}` : filename;

                // ✅ If it's an image => insert <img>, otherwise insert <a href="...">
                if (isImageByExtension(filename, this.imagesExtensions || ['jpg', 'png', 'jpeg', 'gif', 'webp'])) {
                    const tagName = 'img';
                    const elm = fn.createInside.element(tagName);
                    elm.setAttribute('src', src);
                    fn.s.insertImage(elm as HTMLImageElement, null, fn.o.imageDefaultWidth);
                } else {
                    const tagName = 'a';
                    const elm = fn.createInside.element(tagName);
                    elm.setAttribute('href', src);
                    elm.setAttribute('target', '_blank');
                    elm.setAttribute('rel', 'noopener noreferrer');
                    elm.textContent = getDisplayNameFromPath(filename);
                    fn.s.insertNode(elm);
                }
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
