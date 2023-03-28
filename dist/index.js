var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define("@scom/scom-video/interface.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("@scom/scom-video/store.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getIPFSGatewayUrl = exports.setIPFSGatewayUrl = exports.setDataFromSCConfig = exports.state = void 0;
    ///<amd-module name='@scom/scom-video/store.ts'/> 
    exports.state = {
        ipfsGatewayUrl: ""
    };
    const setDataFromSCConfig = (options) => {
        if (options.ipfsGatewayUrl) {
            exports.setIPFSGatewayUrl(options.ipfsGatewayUrl);
        }
    };
    exports.setDataFromSCConfig = setDataFromSCConfig;
    const setIPFSGatewayUrl = (url) => {
        exports.state.ipfsGatewayUrl = url;
    };
    exports.setIPFSGatewayUrl = setIPFSGatewayUrl;
    const getIPFSGatewayUrl = () => {
        return exports.state.ipfsGatewayUrl;
    };
    exports.getIPFSGatewayUrl = getIPFSGatewayUrl;
});
define("@scom/scom-video/index.css.ts", ["require", "exports", "@ijstech/components"], function (require, exports, components_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Theme = components_1.Styles.Theme.ThemeVars;
    components_1.Styles.cssRule('#pnlImage', {
        $nest: {
            '.custom-img img': {
                objectFit: 'cover',
                objectPosition: 'center',
                width: '100%',
                height: '100%',
                maxWidth: 'none',
                maxHeight: 'none'
            },
            '#imgLink span': {
                display: 'block'
            },
            '#edtLink input': {
                border: `1px solid ${Theme.divider}`
            },
            ".angle": {
                zIndex: '200',
                position: 'absolute',
                width: '30px',
                height: '30px',
                background: 'black',
                clipPath: "polygon(0 0, 0 100%, 20% 100%, 20% 20%, 100% 20%, 100% 0)"
            },
            ".transform": {
                transformOrigin: "left top"
            },
            ".angle-nw:hover": {
                cursor: 'nw-resize',
                background: 'blue'
            },
            ".angle-ne:hover": {
                cursor: 'ne-resize',
                background: 'blue'
            },
            ".angle-sw:hover": {
                cursor: 'sw-resize',
                background: 'blue'
            },
            ".angle-se:hover": {
                cursor: 'se-resize',
                background: 'blue'
            },
            ".angle-ne": {
                transform: "rotate(90deg)"
            },
            ".angle-se": {
                transform: "rotate(180deg)"
            },
            ".angle-sw": {
                transform: "rotate(270deg)"
            },
            ".canvas": {
                zIndex: '180',
                position: 'absolute',
                top: '0px',
                left: '0px'
            },
            ".canvas-line": {
                zIndex: '190',
                position: 'absolute',
                top: '0px',
                left: '0px'
            }
        }
    });
});
define("@scom/scom-video/scconfig.json.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ///<amd-module name='@scom/scom-video/scconfig.json.ts'/> 
    exports.default = {
        "name": "@scom-video/main",
        "version": "0.1.0",
        "env": "",
        "moduleDir": "src",
        "main": "@scom-video/main",
        "modules": {},
        "ipfsGatewayUrl": "https://ipfs.scom.dev/ipfs/"
    };
});
define("@scom/scom-video", ["require", "exports", "@ijstech/components", "@scom/scom-video/store.ts", "@scom/scom-video/scconfig.json.ts", "@scom/scom-video/index.css.ts"], function (require, exports, components_2, store_1, scconfig_json_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const configSchema = {
        type: 'object',
        required: [],
        properties: {
            width: {
                type: 'string',
            },
            height: {
                type: 'string'
            }
        }
    };
    let ScomVideo = class ScomVideo extends components_2.Module {
        constructor(parent, options) {
            super(parent, options);
            this.data = {
                url: ''
            };
            this.oldData = {
                url: ''
            };
            if (scconfig_json_1.default)
                store_1.setDataFromSCConfig(scconfig_json_1.default);
        }
        init() {
            super.init();
            const width = this.getAttribute('width', true);
            const height = this.getAttribute('height', true);
            this.setTag({ width: width ? this.width : '480px', height: height ? this.height : '270px' });
            this.url = this.getAttribute('url', true);
        }
        static async create(options, parent) {
            let self = new this(parent, options);
            await self.ready();
            return self;
        }
        get url() {
            var _a;
            return (_a = this.data.url) !== null && _a !== void 0 ? _a : '';
        }
        set url(value) {
            this.setData({ url: value });
        }
        getConfigSchema() {
            return configSchema;
        }
        getData() {
            return this.data;
        }
        getUrl() {
            if (!this.data.url)
                return '';
            const urlRegex = /https:\/\/www.youtube.com\/embed/;
            if (urlRegex.test(this.data.url))
                return this.data.url;
            const queryString = this.data.url.substring(this.data.url.indexOf('?') + 1) || '';
            console.log(queryString);
            const query = new URLSearchParams(queryString);
            const videoId = query.get('v');
            console.log(videoId, query);
            if (videoId)
                return `https://www.youtube.com/embed/${videoId}`;
            return this.data.url;
        }
        async setData(value) {
            this.oldData = this.data;
            this.data = value;
            this.iframeElm.url = this.getUrl();
        }
        getTag() {
            return this.tag;
        }
        async setTag(value) {
            this.tag = value;
            if (this.iframeElm) {
                this.iframeElm.display = 'block';
                this.iframeElm.width = this.tag.width;
                this.iframeElm.height = this.tag.height;
            }
        }
        getEmbedderActions() {
            const propertiesSchema = {
                "type": "object",
                "properties": {
                    "url": {
                        "type": "string",
                        "minLength": 1,
                        required: true
                    }
                }
            };
            const themeSchema = {
                type: 'object',
                properties: {
                    width: {
                        type: 'string',
                        readOnly: true
                    },
                    height: {
                        type: 'string',
                        readOnly: true
                    }
                }
            };
            return this._getActions(propertiesSchema, themeSchema);
        }
        getActions() {
            const propertiesSchema = {
                "type": "object",
                "properties": {
                    "url": {
                        "type": "string",
                        "minLength": 1,
                        required: true
                    }
                }
            };
            const themeSchema = {
                type: 'object',
                properties: {
                    width: {
                        type: 'string'
                    },
                    height: {
                        type: 'string'
                    }
                }
            };
            return this._getActions(propertiesSchema, themeSchema);
        }
        _getActions(settingSchema, themeSchema) {
            const actions = [
                {
                    name: 'Settings',
                    icon: 'cog',
                    command: (builder, userInputData) => {
                        return {
                            execute: () => {
                                if (builder === null || builder === void 0 ? void 0 : builder.setData)
                                    builder.setData(userInputData);
                                this.setData(userInputData);
                            },
                            undo: () => {
                                if (builder === null || builder === void 0 ? void 0 : builder.setData)
                                    builder.setData(this.oldData);
                                this.setData(this.oldData);
                            },
                            redo: () => { }
                        };
                    },
                    userInputDataSchema: settingSchema
                }
            ];
            return actions;
        }
        checkValidation(value) {
            return !!value.url;
        }
        render() {
            return (this.$render("i-panel", null,
                this.$render("i-iframe", { id: "iframeElm" })));
        }
    };
    ScomVideo = __decorate([
        components_2.customModule,
        components_2.customElements('i-scom-video')
    ], ScomVideo);
    exports.default = ScomVideo;
});
