import {
  Module,
  customModule,
  IDataSchema,
  Container,
  ControlElement,
  customElements,
  Panel,
  Iframe
} from '@ijstech/components'
import { IData } from './interface'
import dataJson from './data.json'
import './index.css'

interface ScomVideoElement extends ControlElement {
  lazyLoad?: boolean;
  url: string;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ["i-scom-video"]: ScomVideoElement;
    }
  }
}

@customModule
@customElements('i-scom-video')
export default class ScomVideo extends Module {
  private data: IData = {
    url: ''
  };
  private pnlVideo: Panel
  private videoEl: any

  tag: any = {}

  defaultEdit?: boolean
  validate?: () => boolean
  edit: () => Promise<void>
  confirm: () => Promise<void>
  discard: () => Promise<void>

  constructor(parent?: Container, options?: any) {
    super(parent, options);
  }

  static async create(options?: ScomVideoElement, parent?: Container){
    let self = new this(parent, options);
    await self.ready();
    return self;
  }

  get url() {
    return this.data.url ?? '';
  }
  set url(value: string) {
    this.data.url = value ?? '';
    this.updateVideo();
  }

  private get ism3u8() {
    const regex = /.*\.m3u8$/gi
    return regex.test(this.data?.url || '')
  }

  async init() {
    super.init()
    const width = this.getAttribute('width', true);
    const height = this.getAttribute('height', true);
    this.setTag({width: width ? this.width : '480px', height: height ? this.height : '270px'});
    const lazyLoad = this.getAttribute('lazyLoad', true, false);
    if (!lazyLoad) {
      const url = this.getAttribute('url', true);
      const showHeader = this.getAttribute('showHeader', true, false);
      const showFooter = this.getAttribute('showFooter', true, false);
      await this.setData({ url, showFooter, showHeader });
    }
  }

  private getData() {
    return this.data
  }

  private async setData(value: IData) {
    this.data = value
    this.updateVideo()
  }

  private getUrl() {
    if (!this.data.url) return '';
    const videoId = this.getVideoId(this.data.url);
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    return this.data.url;
  }
  
  private getVideoId(url: string) {
    let regex = /(youtu.*be.*)\/(watch\?v=|embed\/|v|shorts|)(.*?((?=[&#?])|$))/gm;
    return regex.exec(url)?.[3];
  }

  private updateVideo() {
    if (this.data.url.endsWith('.mp4')) {
      if (!this.videoEl || !(this.videoEl instanceof ScomVideo)) {
        this.videoEl = <i-video width={'100%'} height={'100%'} display='block'></i-video>
      }
    } 
    else if (this.ism3u8) {
      if (!this.videoEl || !(this.videoEl instanceof ScomVideo)) {
        this.videoEl = <i-video isStreaming={true} width={'100%'} height={'100%'} display='block'></i-video>
      }
    } 
    else {
      if (!this.videoEl || !(this.videoEl instanceof Iframe)) {
        this.videoEl = <i-iframe width="100%" height="100%" display="flex"></i-iframe>
      }
    }
    this.pnlVideo.clearInnerHTML()
    this.pnlVideo.append(this.videoEl)
    this.videoEl.url = this.ism3u8 ? this.data.url : this.getUrl()
  }

  private getTag() {
    return this.tag
  }

  private async setTag(value: any) {
    this.tag = value;
  }

  getConfigurators() {
    const self = this;
    return [
      {
        name: 'Builder Configurator',
        target: 'Builders',
        getActions: () => {
          return this._getActions();
        },
        getData: this.getData.bind(this),
        setData: async (data: IData) => {
          const defaultData = dataJson.defaultBuilderData as any;
          await this.setData({...defaultData, ...data})
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
          const data = this.data || {};
          return {
            data: window.btoa(JSON.stringify(data))
          }
        },
        setLinkParams: async (params: any) => {
          if (params.data) {
            const utf8String = decodeURIComponent(params.data);
            const decodedString = window.atob(utf8String);
            const newData = JSON.parse(decodedString);
            let resultingData = {
              ...self.data,
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
          return this._getActions()
        },
        getLink: this.getLink.bind(this),
        setLink: (value: string) => {
          const utf8String = decodeURIComponent(value);
          const decodedString = window.atob(utf8String);
          const newData = JSON.parse(decodedString);
          let resultingData = {
            ...self.data,
            ...(newData.properties || {})
          };
          this.setData(resultingData);
        },
        setData: this.setData.bind(this),
        getData: this.getData.bind(this),
        getTag: this.getTag.bind(this),
        setTag: this.setTag.bind(this)
      }
    ]
  }

  private getLink() {
    const encodedWidgetDataString  = window.btoa(JSON.stringify(this._getWidgetData()));
    const loaderUrl = `https://ipfs.scom.dev/ipfs/bafybeia442nl6djz7qipnfk5dxu26pgr2xgpar7znvt3aih2k6nxk7sib4`;
    return `${loaderUrl}?data=${encodedWidgetDataString}`;
  }

  private _getWidgetData() {
    return {
      "module": {
        "name": "@scom/scom-video",
        "localPath": "scom-video"
      },
      "properties": {
        ...(this.data || {})
      }
    }
  }

  private getPropertiesSchema() {
    const schema: IDataSchema = {
      type: "object",
      required: ["url"],
      properties: {
        url: {
          type: "string"
        }
      }
    };
    return schema;
  }

  private _getActions() {
    const propertiesSchema = this.getPropertiesSchema();
    const actions = [
      {
        name: 'Edit',
        icon: 'edit',
        command: (builder: any, userInputData: any) => {
          let oldData = {url: ''};
          return {
            execute: () => {
              oldData = {...this.data};
              if (userInputData?.url) this.data.url = userInputData.url;
              this.updateVideo();
              if (builder?.setData) builder.setData(this.data);
            },
            undo: () => {
              this.data = {...oldData};
              this.updateVideo();
              if (builder?.setData) builder.setData(this.data);
            },
            redo: () => {}
          }
        },
        userInputDataSchema: propertiesSchema as IDataSchema
      }
    ]
    return actions
  }

  render() {
    return (
      <i-panel id="pnlVideo" width={'100%'} height={'100%'}></i-panel>
    )
  }
}
