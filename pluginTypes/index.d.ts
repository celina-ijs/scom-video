/// <reference path="@ijstech/components/index.d.ts" />
/// <amd-module name="@scom/scom-video/data.json.ts" />
declare module "@scom/scom-video/data.json.ts" {
    const _default: {
        ipfsGatewayUrl: string;
        defaultBuilderData: {
            url: string;
        };
        defaultBuilderData2: {
            url: string;
        };
        defaultBuilderData3: {
            url: string;
        };
        defaultBuilderData4: {
            url: string;
        };
    };
    export default _default;
}
/// <amd-module name="@scom/scom-video/model.ts" />
declare module "@scom/scom-video/model.ts" {
    import { IDataSchema, Module } from '@ijstech/components';
    export interface IVideoData {
        url?: string;
    }
    export class Model {
        private module;
        private _data;
        updateWidget: () => void;
        constructor(module: Module);
        get url(): string;
        set url(value: string);
        get ism3u8(): boolean;
        getConfigurators(type?: 'defaultLinkYoutube' | 'defaultLinkMp4' | 'defaultLinkM3u8' | 'defaultLinkEmpty'): ({
            name: string;
            target: string;
            getActions: () => {
                name: string;
                icon: string;
                command: (builder: any, userInputData: any) => {
                    execute: () => void;
                    undo: () => void;
                    redo: () => void;
                };
                userInputDataSchema: IDataSchema;
            }[];
            getData: any;
            setData: (data: IVideoData) => Promise<void>;
            getTag: any;
            setTag: any;
            getLinkParams?: undefined;
            setLinkParams?: undefined;
        } | {
            name: string;
            target: string;
            getActions: () => {
                name: string;
                icon: string;
                command: (builder: any, userInputData: any) => {
                    execute: () => void;
                    undo: () => void;
                    redo: () => void;
                };
                userInputDataSchema: IDataSchema;
            }[];
            getLinkParams: () => {
                data: string;
            };
            setLinkParams: (params: any) => Promise<void>;
            getData: any;
            setData: any;
            getTag: any;
            setTag: any;
        })[];
        private getPropertiesSchema;
        private _getActions;
        setData(value: IVideoData): Promise<void>;
        getData(): IVideoData;
        getTag(): any;
        setTag(value: any): void;
        private updateTag;
        private updateStyle;
        private updateTheme;
        getUrl(): string;
        private getVideoId;
    }
}
/// <amd-module name="@scom/scom-video/index.css.ts" />
declare module "@scom/scom-video/index.css.ts" { }
/// <amd-module name="@scom/scom-video" />
declare module "@scom/scom-video" {
    import { Module, Container, ControlElement } from '@ijstech/components';
    import { IVideoData } from "@scom/scom-video/model.ts";
    import "@scom/scom-video/index.css.ts";
    interface ScomVideoElement extends ControlElement {
        lazyLoad?: boolean;
        url: string;
    }
    global {
        namespace JSX {
            interface IntrinsicElements {
                ["i-scom-video"]: ScomVideoElement;
            }
        }
    }
    export default class ScomVideo extends Module {
        private model;
        private pnlVideo;
        private videoEl;
        tag: any;
        defaultEdit?: boolean;
        constructor(parent?: Container, options?: any);
        static create(options?: ScomVideoElement, parent?: Container): Promise<ScomVideo>;
        get url(): string;
        set url(value: string);
        get ism3u8(): boolean;
        getConfigurators(type?: 'defaultLinkYoutube' | 'defaultLinkMp4' | 'defaultLinkM3u8' | 'defaultLinkEmpty'): ({
            name: string;
            target: string;
            getActions: () => {
                name: string;
                icon: string;
                command: (builder: any, userInputData: any) => {
                    execute: () => void;
                    undo: () => void;
                    redo: () => void;
                };
                userInputDataSchema: import("@ijstech/components").IDataSchema;
            }[];
            getData: any;
            setData: (data: IVideoData) => Promise<void>;
            getTag: any;
            setTag: any;
            getLinkParams?: undefined;
            setLinkParams?: undefined;
        } | {
            name: string;
            target: string;
            getActions: () => {
                name: string;
                icon: string;
                command: (builder: any, userInputData: any) => {
                    execute: () => void;
                    undo: () => void;
                    redo: () => void;
                };
                userInputDataSchema: import("@ijstech/components").IDataSchema;
            }[];
            getLinkParams: () => {
                data: string;
            };
            setLinkParams: (params: any) => Promise<void>;
            getData: any;
            setData: any;
            getTag: any;
            setTag: any;
        })[];
        getData(): IVideoData;
        setData(value: IVideoData): Promise<void>;
        getTag(): any;
        setTag(value: any): Promise<void>;
        private updateVideo;
        private initModel;
        init(): Promise<void>;
        render(): any;
    }
}
