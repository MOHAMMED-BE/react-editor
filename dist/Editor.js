"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.uploaderConfig = void 0;
var react_1 = __importDefault(require("react"));
var jodit_react_1 = __importDefault(require("jodit-react"));
var ReactEditor = function (_a) {
    var onChange = _a.onChange, onBlur = _a.onBlur, value = _a.value, config = _a.config;
    return (react_1.default.createElement(jodit_react_1.default, { value: value, config: config, onBlur: onBlur, onChange: onChange }));
};
var uploaderConfig = function (apiUrl, imageUrl) { return ({
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
        var fn = this.jodit;
        if (e.data.files && e.data.files.length) {
            var tagName_1 = 'img';
            e.data.files.forEach(function (filename, index) {
                var elm = fn.createInside.element(tagName_1);
                elm.setAttribute('src', "".concat(imageUrl, "/").concat(filename));
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
        var files = [];
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
}); };
exports.uploaderConfig = uploaderConfig;
var config = function (includeUploader, apiUrl, imageUrl) { return ({
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
    uploader: includeUploader ? (0, exports.uploaderConfig)(apiUrl, imageUrl) : undefined,
}); };
exports.config = config;
exports.default = ReactEditor;
