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
import { getIPFSGatewayUrl, setDataFromSCConfig } from './store'
import './index.css'
import scconfig from './scconfig.json';

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
    if (scconfig)
      setDataFromSCConfig(scconfig);
  }
  
  init() {
    super.init()
    const width = this.getAttribute('width', true);
    const height = this.getAttribute('height', true);
    this.setTag({width: width ? this.width : '500px', height: height ? this.height : '300px'});
    this.url = this.getAttribute('url', true);
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
    this.data.url = value;
    this.iframeElm.url = this.data.url || ''

    // if (this.data.url?.startsWith('ipfs://')) {
    //   const ipfsGatewayUrl = getIPFSGatewayUrl()
    //   this.iframeElm.url = this.data.url.replace('ipfs://', ipfsGatewayUrl)
    // } else if (value) {
    //   this.iframeElm.url = this.data.url
    // }
  }

  getConfigSchema() {
    return configSchema
  }

  getData() {
    return this.data
  }

  async setData(value: IData) {
    if (!this.checkValidation(value)) return
    this.oldData = this.data
    this.data = value
    this.iframeElm.url = this.data.url || ''
  }

  getTag() {
    return this.tag
  }

  async setTag(value: any) {
    this.tag = value;
    if (this.iframeElm) {
      this.iframeElm.display = 'block';
      this.iframeElm.width = this.tag.width;
      this.iframeElm.height = this.tag.height;
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
      <i-panel>
        <i-iframe id="iframeElm"></i-iframe>
      </i-panel>
    )
  }
}
