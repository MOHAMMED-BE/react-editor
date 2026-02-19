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

type SelectionRef = { current: Range | null };

/**
 * Uploader configuration for Jodit
 * Handles image upload + insertion in the editor
 */
export const uploaderConfig = (apiUrl?: string, imageUrl?: string, selectionRef?: SelectionRef) => ({
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

        const restoreToLastCaret = () => {
            const saved = selectionRef?.current;

            if (saved) {
                try {
                    fn.s.selectRange(saved, true);
                    return;
                } catch {
                    // ignore and fallback
                }
            }

            // fallback: jodit internal save/restore
            if (fn?.s?.focus) fn.s.focus();
            if (fn?.s?.restore) {
                try {
                    fn.s.restore();
                } catch {
                    // ignore
                }
            }
        };

        const refreshSavedRange = () => {
            if (!selectionRef) return;

            try {
                const r: Range = fn.s.range;
                selectionRef.current = r ? r.cloneRange() : null;
            } catch {
                selectionRef.current = null;
            }
        };

        if (e?.data?.files && e.data.files.length) {
            e.data.files.forEach((filename: string) => {
                const src = imageUrl ? `${imageUrl}/${filename}` : filename;

                // ✅ Restore caret BEFORE inserting anything (image or file)
                restoreToLastCaret();

                // ✅ If it's an image => insert <img>, otherwise insert <a href="...">
                if (isImageByExtension(filename, this.imagesExtensions || ['jpg', 'png', 'jpeg', 'gif', 'webp'])) {
                    const tagName = 'img';
                    const elm = fn.createInside.element(tagName);
                    elm.setAttribute('src', src);
                    fn.s.insertImage(elm as HTMLImageElement, null, fn.o.imageDefaultWidth);
                    refreshSavedRange();
                } else {
                    const tagName = 'a';
                    const elm = fn.createInside.element(tagName);
                    elm.setAttribute('href', src);
                    elm.setAttribute('target', '_blank');
                    elm.setAttribute('rel', 'noopener noreferrer');
                    elm.textContent = getDisplayNameFromPath(filename);

                    fn.s.insertNode(elm);

                    if (fn?.s?.setCursorAfter) {
                        try {
                            fn.s.setCursorAfter(elm);
                        } catch {
                            // ignore
                        }
                    }

                    refreshSavedRange();
                }
            });
        }

        return !!e?.success;
    },
    getMessage(e: any): string {
        return e?.data?.messages && Array.isArray(e.data.messages) ? e.data.messages.join('') : '';
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
export const config = ({ includeUploader, apiUrl, imageUrl, onDeleteImage }: ConfigParams = {}) => {
    const selectionRef: SelectionRef = { current: null };

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

        // ✅ Helps preserve selection when editor loses focus (e.g., file dialog)
        saveSelectionOnBlur: true,

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

    const composeAfterInit =
        (a?: (editor: any) => void, b?: (editor: any) => void) =>
            (editor: any) => {
                if (a) a(editor);
                if (b) b(editor);
            };

    if (includeUploader) {
        base.uploader = uploaderConfig(apiUrl, imageUrl, selectionRef);

        const selectionCaptureAfterInit = (editor: any) => {
            const capture = () => {
                try {
                    const r: Range = editor.s.range;
                    selectionRef.current = r ? r.cloneRange() : null;
                } catch {
                    selectionRef.current = null;
                }
            };

            // Capture during normal editing (helps even without toolbar click)
            const editorEl: HTMLElement | null = editor?.editor ?? null;
            const onMouseUp = () => capture();
            const onKeyUp = () => capture();
            const onTouchEnd = () => capture();

            if (editorEl) {
                editorEl.addEventListener('mouseup', onMouseUp);
                editorEl.addEventListener('keyup', onKeyUp);
                editorEl.addEventListener('touchend', onTouchEnd);
            }

            // ✅ IMPORTANT: capture BEFORE toolbar steals focus.
            // We listen on toolbar mousedown in CAPTURE phase.
            const toolbarEl: HTMLElement | null = editor?.toolbarContainer ?? null;
            const onToolbarMouseDownCapture = (ev: MouseEvent) => {
                const target = ev.target as HTMLElement | null;
                if (!target) return;

                const isFileBtn =
                    !!target.closest('[data-ref="file"]') ||
                    !!target.closest('[data-name="file"]') ||
                    !!target.closest('.jodit-toolbar-button_file');

                if (isFileBtn) {
                    capture();
                }
            };

            if (toolbarEl) {
                toolbarEl.addEventListener('mousedown', onToolbarMouseDownCapture, true);
            }

            // cleanup
            editor?.e?.on?.('beforeDestruct', () => {
                if (editorEl) {
                    editorEl.removeEventListener('mouseup', onMouseUp);
                    editorEl.removeEventListener('keyup', onKeyUp);
                    editorEl.removeEventListener('touchend', onTouchEnd);
                }
                if (toolbarEl) {
                    toolbarEl.removeEventListener('mousedown', onToolbarMouseDownCapture, true);
                }
            });
        };

        base.events = {
            ...(base.events || {}),
        };
        base.events.afterInit = composeAfterInit(base.events.afterInit, selectionCaptureAfterInit);
    }

    if (onDeleteImage) {
        base.events = {
            ...(base.events || {}),
        };

        const deleteImageAfterInit = (editor: any) => {
            const extractImageSrcs = (html: string): Set<string> => {
                const container = document.createElement('div');
                container.innerHTML = html || '';
                const imgs = Array.from(container.getElementsByTagName('img')) as HTMLImageElement[];

                return new Set(imgs.map((img) => img.getAttribute('src') || '').filter((src) => !!src));
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
        };

        base.events.afterInit = composeAfterInit(base.events.afterInit, deleteImageAfterInit);
    }

    return base;
};

export default ReactEditor;
