"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const jodit_react_1 = __importDefault(require("jodit-react"));
const react_2 = __importDefault(require("react"));
const ReactEditor = ({ onChange, onBlur, value, useUploadImage, apiUrl, imageUrl }) => {
    const editor = (0, react_1.useRef)(null);
    const uploaderConfig = {
        imagesExtensions: ['jpg', 'png', 'jpeg', 'gif', 'webp'],
        filesVariableName: function (t) {
            return 'files[' + t + ']';
        },
        url: apiUrl,
        withCredentials: false,
        format: 'json',
        method: 'POST',
        prepareData: function (formdata) {
            return formdata;
        },
        isSuccess: function (e) {
            const fn = this.jodit;
            if (e.data.files && e.data.files.length) {
                const tagName = 'img';
                e.data.files.forEach((filename, index) => {
                    const elm = fn.createInside.element(tagName);
                    elm.setAttribute('src', `${imageUrl}/${filename}`);
                    fn.s.insertImage(elm, null, fn.o.imageDefaultWidth);
                });
            }
            return e.success;
        },
        getMessage: function (e) {
            return e.data.messages && Array.isArray(e.data.messages)
                ? e.data.messages.join('')
                : '';
        },
        process: function (resp) {
            let files = [];
            files.unshift(resp.data);
            return {
                files: resp.data,
                error: resp.msg,
                msg: resp.msg,
            };
        },
        error: function (e) {
            this.j.e.fire('errorMessage', e.message, 'error', 4000);
        },
        defaultHandlerError: function (e) {
            this.j.e.fire('errorMessage', e.message);
        },
    };
    const config = (0, react_1.useMemo)(() => ({
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
    }), []);
    return (react_2.default.createElement(jodit_react_1.default, { ref: editor, value: value, config: config, onBlur: onBlur, onChange: onChange }));
};
exports.default = ReactEditor;
