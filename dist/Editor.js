"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
        var _a;
        var fn = this.jodit;
        if (((_a = e === null || e === void 0 ? void 0 : e.data) === null || _a === void 0 ? void 0 : _a.files) && e.data.files.length) {
            var tagName_1 = 'img';
            e.data.files.forEach(function (filename) {
                var elm = fn.createInside.element(tagName_1);
                var src = imageUrl ? "".concat(imageUrl, "/").concat(filename) : filename;
                elm.setAttribute('src', src);
                fn.s.insertImage(elm, null, fn.o.imageDefaultWidth);
            });
        }
        return !!(e === null || e === void 0 ? void 0 : e.success);
    },
    getMessage: function (e) {
        var _a;
        return ((_a = e === null || e === void 0 ? void 0 : e.data) === null || _a === void 0 ? void 0 : _a.messages) && Array.isArray(e.data.messages)
            ? e.data.messages.join('')
            : '';
    },
    process: function (resp) {
        var files = [];
        files.unshift(resp === null || resp === void 0 ? void 0 : resp.data);
        return {
            files: resp === null || resp === void 0 ? void 0 : resp.data,
            error: resp === null || resp === void 0 ? void 0 : resp.msg,
            msg: resp === null || resp === void 0 ? void 0 : resp.msg,
        };
    },
    error: function (e) {
        this.j.e.fire('errorMessage', e.message, 'error', 4000);
    },
    defaultHandlerError: function (e) {
        this.j.e.fire('errorMessage', (e === null || e === void 0 ? void 0 : e.message) || 'Upload error');
    },
}); };
exports.uploaderConfig = uploaderConfig;
var config = function (_a) {
    var _b = _a === void 0 ? {} : _a, includeUploader = _b.includeUploader, apiUrl = _b.apiUrl, imageUrl = _b.imageUrl, onDeleteImage = _b.onDeleteImage;
    var base = {
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
        base.uploader = (0, exports.uploaderConfig)(apiUrl, imageUrl);
    }
    if (onDeleteImage) {
        base.events = __assign(__assign({}, (base.events || {})), { afterInit: function (editor) {
                var _this = this;
                var extractImageSrcs = function (html) {
                    var container = document.createElement('div');
                    container.innerHTML = html || '';
                    var imgs = Array.from(container.getElementsByTagName('img'));
                    return new Set(imgs
                        .map(function (img) { return img.getAttribute('src') || ''; })
                        .filter(function (src) { return !!src; }));
                };
                var prevValue = editor.value || '';
                var prevSrcs = extractImageSrcs(prevValue);
                editor.events.on('change', function () { return __awaiter(_this, void 0, void 0, function () {
                    var currentValue, currentSrcs;
                    return __generator(this, function (_a) {
                        currentValue = editor.value || '';
                        currentSrcs = extractImageSrcs(currentValue);
                        prevSrcs.forEach(function (src) {
                            if (!currentSrcs.has(src)) {
                                if (!imageUrl || src.startsWith(imageUrl)) {
                                    void onDeleteImage(src);
                                }
                            }
                        });
                        prevValue = currentValue;
                        prevSrcs = currentSrcs;
                        return [2];
                    });
                }); });
            } });
    }
    return base;
};
exports.config = config;
exports.default = ReactEditor;
