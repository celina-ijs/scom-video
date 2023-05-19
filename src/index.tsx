import {
  Module,
  customModule,
  IDataSchema,
  Container,
  ControlElement,
  customElements,
  Iframe
} from '@ijstech/components'
import { IData } from './interface'
import {} from '@ijstech/eth-contract'
import {} from '@ijstech/eth-wallet'
import ScomDappContainer from '@scom/scom-dapp-container'
import dataJson from './data.json'
import './index.css'

interface ScomVideoElement extends ControlElement {
  url: string;
  showHeader?: boolean;
  showFooter?: boolean;
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
  private iframeElm: Iframe
  private dappContainer: ScomDappContainer

  tag: any = {}

  readonly onConfirm: () => Promise<void>
  readonly onDiscard: () => Promise<void>
  readonly onEdit: () => Promise<void>

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
    this.setData({url: value});
  }

  get showFooter() {
    return this.data.showFooter ?? false
  }
  set showFooter(value: boolean) {
    this.data.showFooter = value
    if (this.dappContainer) this.dappContainer.showFooter = this.showFooter;
  }

  get showHeader() {
    return this.data.showHeader ?? false
  }
  set showHeader(value: boolean) {
    this.data.showHeader = value
    if (this.dappContainer) this.dappContainer.showHeader = this.showHeader;
  }
  
  init() {
    super.init()
    const width = this.getAttribute('width', true);
    const height = this.getAttribute('height', true);
    this.setTag({width: width ? this.width : '480px', height: height ? this.height : '270px'});
    this.url = this.getAttribute('url', true);
    this.showHeader = this.getAttribute('showHeader', true, false)
    this.showFooter = this.getAttribute('showFooter', true, false)
  }

  private getData() {
    return this.data
  }

  private async setData(value: IData) {
    this.data = value
    this.iframeElm.url = this.getUrl()
    if (this.dappContainer) {
      this.dappContainer.showHeader = this.showHeader;
      this.dappContainer.showFooter = this.showFooter;
    }
  }

  private getUrl() {
    if (!this.data.url) return '';
    const urlRegex = /https:\/\/www.youtube.com\/embed/;
    if (urlRegex.test(this.data.url)) return this.data.url;
    const queryString = this.data.url.substring(this.data.url.indexOf('?') + 1) || ''
    const query = new URLSearchParams(queryString);
    const videoId = query.get('v');
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    return this.data.url;
  }

  private getTag() {
    return this.tag
  }

  private async setTag(value: any) {
    this.tag = value;
    if (this.dappContainer) {
      this.dappContainer.width = this.tag.width;
      this.dappContainer.height = this.tag.height;
    }
  }

  getConfigurators() {
    const self = this;
    return [
      {
        name: 'Builder Configurator',
        target: 'Builders',
        getActions: () => {
          const propertiesSchema = this.getPropertiesSchema();
          const themeSchema = this.getThemeSchema();
          return this._getActions(propertiesSchema, themeSchema);
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
          const propertiesSchema = this.getPropertiesSchema();
          const themeSchema = this.getThemeSchema(true);
          return this._getActions(propertiesSchema, themeSchema);
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
      }
    ]
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

  private getThemeSchema(readOnly = false) {
    const themeSchema: IDataSchema = {
      type: 'object',
      properties: {
        width: {
          type: 'string',
          readOnly
        },
        height: {
          type: 'string',
          readOnly
        }
      }
    }
    return themeSchema;
  }

  private _getActions(settingSchema: IDataSchema, themeSchema: IDataSchema) {
    const actions = [
      {
        name: 'Settings',
        icon: 'cog',
        command: (builder: any, userInputData: any) => {
          let oldData = {url: ''};
          return {
            execute: () => {
              oldData = {...this.data};
              if (userInputData?.url) this.data.url = userInputData.url;
              this.iframeElm.url = this.getUrl();
              if (builder?.setData) builder.setData(this.data);
            },
            undo: () => {
              this.data = {...oldData};
              this.iframeElm.url = this.getUrl();
              if (builder?.setData) builder.setData(this.data);
            },
            redo: () => {}
          }
        },
        userInputDataSchema: settingSchema as IDataSchema
      }
    ]
    return actions
  }

  render() {
    return (
      <i-scom-dapp-container id="dappContainer" showWalletNetwork={false} display="block">
        <i-iframe id="iframeElm" width="100%" height="100%" display="flex"></i-iframe>
      </i-scom-dapp-container>
    )
  }
}
