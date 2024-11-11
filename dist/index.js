var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define("@scom/scom-video/data.json.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ///<amd-module name='@scom/scom-video/data.json.ts'/> 
    exports.default = {
        "ipfsGatewayUrl": "https://ipfs.scom.dev/ipfs/",
        "defaultBuilderData": {
            "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        },
        "defaultBuilderData2": {
            "url": "https://static.flot.ai/file/karavideo/happy-cat.mp4"
        },
        "defaultBuilderData3": {
            "url": ""
        },
        "defaultBuilderData4": {
            "url": ""
        },
    };
});
define("@scom/scom-video/model.ts", ["require", "exports", "@scom/scom-video/data.json.ts"], function (require, exports, data_json_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Model = void 0;
    class Model {
        constructor(module) {
            this._data = { url: '' };
            this.module = module;
        }
        get url() {
            return this._data.url || '';
        }
        set url(value) {
            this._data.url = value ?? '';
            this.updateWidget();
        }
        get ism3u8() {
            const regex = /.*\.m3u8$/gi;
            return regex.test(this._data?.url || '');
        }
        getConfigurators(type) {
            const self = this;
            return [
                {
                    name: 'Builder Configurator',
                    target: 'Builders',
                    getActions: () => {
                        return this._getActions();
                    },
                    getData: this.getData.bind(this),
                    setData: async (data) => {
                        let defaultData = data_json_1.default.defaultBuilderData4; //empty
                        switch (type) {
                            case 'defaultLinkYoutube':
                                defaultData = data_json_1.default.defaultBuilderData;
                                break;
                            case 'defaultLinkMp4':
                                defaultData = data_json_1.default.defaultBuilderData2;
                                break;
                            case 'defaultLinkM3u8':
                                defaultData = data_json_1.default.defaultBuilderData3;
                                break;
                        }
                        await this.setData({ ...defaultData, ...data });
                    },
                    getTag: this.getTag.bind(this),
                    setTag: this.setTag.bind(this)
                },
                {
                    name: 'Emdedder Configurator',
                    target: 'Embedders',
                    getActions: () => {
                        return this._getActions();
                    },
                    getLinkParams: () => {
                        const data = this._data || {};
                        return {
                            data: window.btoa(JSON.stringify(data))
                        };
                    },
                    setLinkParams: async (params) => {
                        if (params.data) {
                            const utf8String = decodeURIComponent(params.data);
                            const decodedString = window.atob(utf8String);
                            const newData = JSON.parse(decodedString);
                            let resultingData = {
                                ...self._data,
                                ...newData
                            };
                            await this.setData(resultingData);
                        }
                    },
                    getData: this.getData.bind(this),
                    setData: this.setData.bind(this),
                    getTag: this.getTag.bind(this),
                    setTag: this.setTag.bind(this)
                },
                {
                    name: 'Editor',
                    target: 'Editor',
                    getActions: () => {
                        return this._getActions();
                    },
                    setData: async (data) => {
                        const defaultData = data_json_1.default.defaultBuilderData;
                        await this.setData({ ...defaultData, ...data });
                    },
                    getData: this.getData.bind(this),
                    getTag: this.getTag.bind(this),
                    setTag: this.setTag.bind(this)
                }
            ];
        }
        getPropertiesSchema() {
            const schema = {
                type: "object",
                required: ["url"],
                properties: {
                    url: {
                        type: "string",
                        tooltip: "Examples:<br>YouTube full link: https://www.youtube.com/watch?v=dQw4w9WgXcQ,<br>YouTube video ID: dQw4w9WgXcQ<br>mp4 file: https://static.flot.ai/file/karavideo/happy-cat.mp4",
                    }
                }
            };
            return schema;
        }
        _getActions() {
            const propertiesSchema = this.getPropertiesSchema();
            const actions = [
                {
                    name: 'Edit',
                    icon: 'edit',
                    command: (builder, userInputData) => {
                        let oldData = { url: '' };
                        return {
                            execute: () => {
                                oldData = { ...this._data };
                                if (userInputData?.url)
                                    this._data.url = userInputData.url;
                                this.updateWidget();
                                if (builder?.setData)
                                    builder.setData(this._data);
                            },
                            undo: () => {
                                this._data = { ...oldData };
                                this.updateWidget();
                                if (builder?.setData)
                                    builder.setData(this._data);
                            },
                            redo: () => { }
                        };
                    },
                    userInputDataSchema: propertiesSchema
                }
            ];
            return actions;
        }
        async setData(value) {
            this._data = value;
            this.updateWidget();
        }
        getData() {
            return this._data;
        }
        getTag() {
            return this.module.tag;
        }
        setTag(value) {
            const newValue = value || {};
            for (let prop in newValue) {
                if (newValue.hasOwnProperty(prop)) {
                    if (prop === 'light' || prop === 'dark')
                        this.updateTag(prop, newValue[prop]);
                    else
                        this.module.tag[prop] = newValue[prop];
                }
            }
            this.updateTheme();
        }
        updateTag(type, value) {
            this.module.tag[type] = this.module.tag[type] ?? {};
            for (let prop in value) {
                if (value.hasOwnProperty(prop))
                    this.module.tag[type][prop] = value[prop];
            }
        }
        updateStyle(name, value) {
            if (value) {
                this.module.style.setProperty(name, value);
            }
            else {
                this.module.style.removeProperty(name);
            }
        }
        updateTheme() {
            const themeVar = document.body.style.getPropertyValue('--theme') || 'light';
            this.updateStyle('--text-primary', this.module.tag[themeVar]?.fontColor);
            this.updateStyle('--background-main', this.module.tag[themeVar]?.backgroundColor);
        }
        getUrl() {
            if (!this.url)
                return '';
            const videoId = this.getVideoId(this.url);
            if (videoId)
                return `https://www.youtube.com/embed/${videoId}`;
            return this.url;
        }
        getVideoId(url) {
            let regex = /(youtu.*be.*)\/(watch\?v=|watch\?.+&v=|live\/|shorts\/|embed\/|v\/|)(.*?((?=[&#?])|$))/gm;
            return regex.exec(url)?.[3] || url;
        }
    }
    exports.Model = Model;
});
define("@scom/scom-video/index.css.ts", ["require", "exports", "@ijstech/components"], function (require, exports, components_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Theme = components_1.Styles.Theme.ThemeVars;
    components_1.Styles.cssRule('i-scom-video', {
        $nest: {
            '#pnlModule': {
                height: '100%'
            },
            '.video-js  .vjs-big-play-button': {
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
            },
            'i-iframe': {
                aspectRatio: '16/9'
            },
            'i-video video': {
                aspectRatio: '16/9'
            }
        }
    });
});
define("@scom/scom-video", ["require", "exports", "@ijstech/components", "@scom/scom-video/model.ts", "@scom/scom-video/index.css.ts"], function (require, exports, components_2, model_1) {
    "use strict";
    var ScomVideo_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    let ScomVideo = ScomVideo_1 = class ScomVideo extends components_2.Module {
        constructor(parent, options) {
            super(parent, options);
            this.tag = {};
        }
        static async create(options, parent) {
            let self = new this(parent, options);
            await self.ready();
            return self;
        }
        get url() {
            return this.model.url;
        }
        set url(value) {
            this.model.url = value ?? '';
        }
        get ism3u8() {
            return this.model.ism3u8;
        }
        addBlock(blocknote, executeFn, callbackFn) {
            const blockType = 'video';
            const findRegex = /(?:https?:\/\/\S+\.(?:mp4|webm|mov|ogg|m3u8))|(?:https:\/\/(?:www\.|m\.)?(youtu.*be.*)\/(?:watch\?v=|embed\/|v|shorts|)(.*?((?=[&#?])|$)))/g;
            function getData(element) {
                const url = element.getAttribute('href');
                if (url) {
                    const match = findRegex.test(url);
                    findRegex.lastIndex = 0;
                    if (match) {
                        return { url };
                    }
                }
                return false;
            }
            const VideoBlock = blocknote.createBlockSpec({
                type: blockType,
                propSchema: {
                    ...blocknote.defaultProps,
                    url: { default: '' },
                    width: { default: 512 },
                    height: { default: 'auto' }
                },
                content: "none"
            }, {
                render: (block) => {
                    const wrapper = new components_2.Panel();
                    const { url } = JSON.parse(JSON.stringify(block.props));
                    const customElm = new ScomVideo_1(wrapper, { url });
                    if (typeof callbackFn === 'function')
                        callbackFn(customElm, block);
                    wrapper.appendChild(customElm);
                    return {
                        dom: wrapper
                    };
                },
                parseFn: () => {
                    return [
                        {
                            tag: `div[data-content-type=${blockType}]`,
                            node: blockType
                        },
                        {
                            tag: "a",
                            getAttrs: (element) => {
                                if (typeof element === "string")
                                    return false;
                                return getData(element);
                            },
                            priority: 404,
                            node: blockType
                        },
                        {
                            tag: "p",
                            getAttrs: (element) => {
                                if (typeof element === "string")
                                    return false;
                                const child = element.firstChild;
                                if (child?.nodeName === 'A') {
                                    return getData(child);
                                }
                                return false;
                            },
                            priority: 405,
                            node: blockType
                        }
                    ];
                },
                toExternalHTML: (block, editor) => {
                    const link = document.createElement("a");
                    const url = block.props.url || "";
                    link.setAttribute("href", url);
                    link.textContent = 'video';
                    const wrapper = document.createElement("p");
                    wrapper.appendChild(link);
                    return {
                        dom: wrapper
                    };
                },
                pasteRules: [
                    {
                        find: findRegex,
                        handler(props) {
                            const { state, chain, range } = props;
                            const textContent = state.doc.resolve(range.from).nodeAfter?.textContent;
                            chain().BNUpdateBlock(state.selection.from, {
                                type: blockType,
                                props: {
                                    url: textContent
                                },
                            }).setTextSelection(range.from + 1);
                        }
                    }
                ]
            });
            const VideoSlashItem = {
                name: "Video",
                execute: (editor) => {
                    const block = { type: blockType, props: { url: "" } };
                    if (typeof executeFn === 'function')
                        executeFn(editor, block);
                },
                aliases: ["video", "media"],
                group: "Media",
                icon: { name: 'video' },
                hint: "Insert a video"
            };
            const moduleData = {
                name: '@scom/scom-video',
                localPath: 'scom-video'
            };
            return { block: VideoBlock, slashItem: VideoSlashItem, moduleData };
        }
        getConfigurators(type) {
            this.initModel();
            return this.model.getConfigurators(type);
        }
        getData() {
            return this.model.getData();
        }
        async setData(value) {
            this.model.setData(value);
        }
        getTag() {
            return this.tag;
        }
        async setTag(value) {
            this.model.setTag(value);
        }
        updateVideo() {
            if (this.url.endsWith('.mp4') || this.url.endsWith('.mov')) {
                if (!this.videoEl || !(this.videoEl instanceof ScomVideo_1)) {
                    this.videoEl = this.$render("i-video", { width: '100%', height: '100%', display: "block" });
                    this.pnlVideo.clearInnerHTML();
                    this.pnlVideo.append(this.videoEl);
                    this.videoEl.url = this.url;
                }
            }
            else if (this.ism3u8) {
                if (!this.videoEl || !(this.videoEl instanceof ScomVideo_1)) {
                    this.videoEl = this.$render("i-video", { isStreaming: true, width: '100%', height: '100%', display: "block" });
                    this.pnlVideo.clearInnerHTML();
                    this.pnlVideo.append(this.videoEl);
                    this.videoEl.url = this.url;
                }
            }
            else { // should be YouTube
                if (!this.videoEl || !(this.videoEl instanceof components_2.Iframe)) {
                    this.videoEl = this.$render("i-iframe", { width: "100%", height: "100%", display: "flex", allowFullscreen: true });
                    this.pnlVideo.clearInnerHTML();
                    this.pnlVideo.append(this.videoEl);
                    this.videoEl.url = this.model.getUrl();
                }
            }
        }
        initModel() {
            if (!this.model) {
                this.model = new model_1.Model(this);
                this.model.updateWidget = this.updateVideo.bind(this);
            }
        }
        async init() {
            this.initModel();
            super.init();
            if (!this.onClick)
                this.onClick = (target, event) => event.stopPropagation();
            const width = this.getAttribute('width', true);
            const height = this.getAttribute('height', true);
            this.setTag({ width: width ? this.width : '480px', height: height ? this.height : '270px' });
            const lazyLoad = this.getAttribute('lazyLoad', true, false);
            if (!lazyLoad) {
                const url = this.getAttribute('url', true);
                if (url)
                    await this.setData({ url });
            }
        }
        render() {
            return (this.$render("i-panel", { id: "pnlVideo", width: '100%', height: '100%' }));
        }
    };
    ScomVideo = ScomVideo_1 = __decorate([
        components_2.customModule,
        (0, components_2.customElements)('i-scom-video')
    ], ScomVideo);
    exports.default = ScomVideo;
});
