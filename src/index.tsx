import {
  Module,
  customModule,
  IDataSchema,
  Container,
  ControlElement,
  customElements,
  Iframe
} from '@ijstech/components'
import { IData, PageBlock } from './interface'
import {} from '@ijstech/eth-contract'
import {} from '@ijstech/eth-wallet'
import ScomDappContainer from '@scom/scom-dapp-container'
import './index.css'

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
}

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
export default class ScomVideo extends Module implements PageBlock {
  private data: IData = {
    url: ''
  };
  private oldData: IData = {
    url: ''
  };
  private iframeElm: Iframe
  private dappContainer: ScomDappContainer

  tag: any

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

  get showFooter() {
    return this.data.showFooter ?? true
  }
  set showFooter(value: boolean) {
    this.data.showFooter = value
    if (this.dappContainer) this.dappContainer.showFooter = this.showFooter;
  }

  get showHeader() {
    return this.data.showHeader ?? true
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
    this.showHeader = this.getAttribute('showHeader', true)
    this.showFooter = this.getAttribute('showFooter', true)
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

  getConfigSchema() {
    return configSchema
  }

  getData() {
    return this.data
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

  async setData(value: IData) {
    this.oldData = this.data
    this.data = value
    this.iframeElm.url = this.getUrl()
    if (this.dappContainer) {
      this.dappContainer.showHeader = this.showHeader;
      this.dappContainer.showFooter = this.showFooter;
    }
  }

  getTag() {
    return this.tag
  }

  async setTag(value: any) {
    this.tag = value;
    if (this.dappContainer) {
      this.dappContainer.width = this.tag.width;
      this.dappContainer.height = this.tag.height;
    }
  }

  getEmbedderActions() {
    const propertiesSchema: IDataSchema = {
      "type": "object",
      "properties": {
        "url": {
          "type": "string",
          "minLength": 1,
          required: true
        }
      }
    };

    const themeSchema: IDataSchema = {
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
    }

    return this._getActions(propertiesSchema, themeSchema);
  }

  getActions() {
    const propertiesSchema: IDataSchema = {
      "type": "object",
      "properties": {
        "url": {
          "type": "string",
          "minLength": 1,
          required: true
        }
      }
    };

    const themeSchema: IDataSchema = {
      type: 'object',
      properties: {
        width: {
          type: 'string'
        },
        height: {
          type: 'string'
        }
      }
    }

    return this._getActions(propertiesSchema, themeSchema);
  }

  _getActions(settingSchema: IDataSchema, themeSchema: IDataSchema) {
    const actions = [
      {
        name: 'Settings',
        icon: 'cog',
        command: (builder: any, userInputData: any) => {
          return {
            execute: () => {
              if (builder?.setData) builder.setData(userInputData);
              this.setData(userInputData);
            },
            undo: () => {
              if (builder?.setData) builder.setData(this.oldData);
              this.setData(this.oldData);
            },
            redo: () => {}
          }
        },
        userInputDataSchema: settingSchema as IDataSchema
      }
    ]
    return actions
  }

  checkValidation(value: IData): boolean {
    return !!value.url;
  }

  render() {
    return (
      <i-scom-dapp-container id="dappContainer" showWalletNetwork={false} display="block">
        <i-iframe id="iframeElm" width="100%" height="100%" display="flex"></i-iframe>
      </i-scom-dapp-container>
    )
  }
}
