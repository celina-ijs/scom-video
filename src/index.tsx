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
import { setDataFromSCConfig } from './store'
import './index.css'
import scconfig from './scconfig.json';

// const configSchema = {
//   type: 'object',
//   required: [],
//   properties: {
//     width: {
//       type: 'string',
//     },
//     height: {
//       type: 'string'
//     }
//   }
// }

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
export default class ScomVideo extends Module {
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
    this.setTag({width: width ? this.width : '480px', height: height ? this.height : '270px'});
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
    this.setData({url: value});
  }

  // getConfigSchema() {
  //   return configSchema
  // }

  private getData() {
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

  private async setData(value: IData) {
    this.oldData = this.data
    this.data = value
    this.iframeElm.url = this.getUrl()
  }

  private getTag() {
    return this.tag
  }

  private async setTag(value: any) {
    this.tag = value;
    if (this.iframeElm) {
      this.iframeElm.display = 'block';
      this.iframeElm.width = this.tag.width;
      this.iframeElm.height = this.tag.height;
    }
  }

  private getEmbedderActions() {
    const propertiesSchema: IDataSchema = {
      type: "object",
      required: ["url"],
      properties: {
        url: {
          type: "string"
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

  private getActions() {
    const propertiesSchema: IDataSchema = {
      type: "object",
      required: ["url"],
      properties: {
        url: {
          type: "string"
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

  getConfigurators() {
    return [
      {
        name: 'Builder Configurator',
        target: 'Builders',
        getActions: this.getActions.bind(this),
        getData: this.getData.bind(this),
        setData: this.setData.bind(this),
        getTag: this.getTag.bind(this),
        setTag: this.setTag.bind(this)
      },
      {
        name: 'Emdedder Configurator',
        target: 'Embedders',
        getActions: this.getEmbedderActions.bind(this),
        getData: this.getData.bind(this),
        setData: this.setData.bind(this),
        getTag: this.getTag.bind(this),
        setTag: this.setTag.bind(this)
      }
    ]
  }

  private _getActions(settingSchema: IDataSchema, themeSchema: IDataSchema) {
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

  render() {
    return (
      <i-panel>
        <i-iframe id="iframeElm"></i-iframe>
      </i-panel>
    )
  }
}
