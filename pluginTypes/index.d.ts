/// <amd-module name="@scom/scom-video/interface.ts" />
declare module "@scom/scom-video/interface.ts" {
    import { IDataSchema } from "@ijstech/components";
    export interface ICommand {
        execute(): void;
        undo(): void;
        redo(): void;
    }
    export interface IPageBlockAction {
        name: string;
        icon: string;
        command: (builder: any, userInputData: any) => ICommand;
        userInputDataSchema: IDataSchema;
    }
    export interface IData {
        url: string;
        showHeader?: boolean;
        showFooter?: boolean;
    }
}
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
/// <amd-module name="@scom/scom-video/index.css.ts" />
declare module "@scom/scom-video/index.css.ts" { }
/// <amd-module name="@scom/scom-video" />
declare module "@scom/scom-video" {
    import { Module, IDataSchema, Container, ControlElement } from '@ijstech/components';
    import { IData } from "@scom/scom-video/interface.ts";
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
        private data;
        private pnlVideo;
        private videoEl;
        tag: any;
        defaultEdit?: boolean;
        validate?: () => boolean;
        edit: () => Promise<void>;
        confirm: () => Promise<void>;
        discard: () => Promise<void>;
        constructor(parent?: Container, options?: any);
        static create(options?: ScomVideoElement, parent?: Container): Promise<ScomVideo>;
        get url(): string;
        set url(value: string);
        private get ism3u8();
        init(): Promise<void>;
        private getData;
        private setData;
        private getUrl;
        private getVideoId;
        private updateVideo;
        private getTag;
        private setTag;
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
            setData: (data: IData) => Promise<void>;
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
        render(): any;
    }
}
