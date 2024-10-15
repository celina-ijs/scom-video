import { IDataSchema, Module } from '@ijstech/components';
import dataJson from './data.json'

export interface IVideoData {
  url?: string;
}

export class Model {
  private module: Module;
  private _data: IVideoData = { url: '' };
  updateWidget: () => void;

  constructor(module: Module) {
    this.module = module;
  }

  get url() {
    return this._data.url || '';
  }

  set url(value: string) {
    this._data.url = value ?? '';
    this.updateWidget();
  }

  get ism3u8() {
    const regex = /.*\.m3u8$/gi;
    return regex.test(this._data?.url || '');
  }

  getConfigurators(type?: 'defaultLinkYoutube' | 'defaultLinkMp4' | 'defaultLinkM3u8' | 'defaultLinkEmpty') {
    const self = this;
    return [
      {
        name: 'Builder Configurator',
        target: 'Builders',
        getActions: () => {
          return this._getActions();
        },
        getData: this.getData.bind(this),
        setData: async (data: IVideoData) => {
          let defaultData = dataJson.defaultBuilderData4; //empty
          switch (type) {
            case 'defaultLinkYoutube':
              defaultData = dataJson.defaultBuilderData;
              break;
            case 'defaultLinkMp4':
              defaultData = dataJson.defaultBuilderData2;
              break;
            case 'defaultLinkM3u8':
              defaultData = dataJson.defaultBuilderData3;
              break;
          }
          await this.setData({ ...defaultData, ...data })
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
          }
        },
        setLinkParams: async (params: any) => {
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
          return this._getActions()
        },
        setData: async (data: IVideoData) => {
          const defaultData = dataJson.defaultBuilderData as any;
          await this.setData({ ...defaultData, ...data })
        },
        getData: this.getData.bind(this),
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
          type: "string",
          tooltip: "Examples:<br>YouTube full link: https://www.youtube.com/watch?v=dQw4w9WgXcQ,<br>YouTube video ID: dQw4w9WgXcQ<br>mp4 file: https://static.flot.ai/file/karavideo/happy-cat.mp4",
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
          let oldData: IVideoData = { url: '' };
          return {
            execute: () => {
              oldData = { ...this._data };
              if (userInputData?.url) this._data.url = userInputData.url;
              this.updateWidget();
              if (builder?.setData) builder.setData(this._data);
            },
            undo: () => {
              this._data = { ...oldData };
              this.updateWidget();
              if (builder?.setData) builder.setData(this._data);
            },
            redo: () => { }
          }
        },
        userInputDataSchema: propertiesSchema as IDataSchema
      }
    ]
    return actions
  }

  async setData(value: IVideoData) {
    this._data = value;
    this.updateWidget();
  }

  getData() {
    return this._data;
  }

  getTag() {
    return this.module.tag;
  }

  setTag(value: any) {
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

  private updateTag(type: 'light' | 'dark', value: any) {
    this.module.tag[type] = this.module.tag[type] ?? {};
    for (let prop in value) {
      if (value.hasOwnProperty(prop))
        this.module.tag[type][prop] = value[prop];
    }
  }

  private updateStyle(name: string, value: any) {
    if (value) {
      this.module.style.setProperty(name, value);
    } else {
      this.module.style.removeProperty(name);
    }
  }

  private updateTheme() {
    const themeVar = document.body.style.getPropertyValue('--theme') || 'light';
    this.updateStyle('--text-primary', this.module.tag[themeVar]?.fontColor);
    this.updateStyle('--background-main', this.module.tag[themeVar]?.backgroundColor);
  }

  getUrl() {
    if (!this.url) return '';
    const videoId = this.getVideoId(this.url);
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    return this.url;
  }

  private getVideoId(url: string) {
    let regex = /(youtu.*be.*)\/(watch\?v=|watch\?.+&v=|live\/|shorts\/|embed\/|v\/|)(.*?((?=[&#?])|$))/gm;
    return regex.exec(url)?.[3] || url;
  }
}
