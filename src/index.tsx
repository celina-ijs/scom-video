import {
  Module,
  customModule,
  Container,
  ControlElement,
  customElements,
  Panel,
  Iframe,
  Control
} from '@ijstech/components';
import { IVideoData, Model } from './model';
import './index.css';

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
  private model: Model;
  private pnlVideo: Panel;
  private videoEl: any;

  tag: any = {};
  defaultEdit?: boolean

  constructor(parent?: Container, options?: any) {
    super(parent, options);
  }

  static async create(options?: ScomVideoElement, parent?: Container) {
    let self = new this(parent, options);
    await self.ready();
    return self;
  }

  get url() {
    return this.model.url;
  }

  set url(value: string) {
    this.model.url = value ?? '';
  }

  get ism3u8() {
    return this.model.ism3u8;
  }

  getConfigurators(type?: 'defaultLinkYoutube' | 'defaultLinkMp4' | 'defaultLinkM3u8' | 'defaultLinkEmpty') {
    this.initModel();
    return this.model.getConfigurators(type);
  }

  getData() {
    return this.model.getData();
  }

  async setData(value: IVideoData) {
    this.model.setData(value);
  }

  getTag() {
    return this.tag;
  }

  async setTag(value: any) {
    this.model.setTag(value);
  }

  private updateVideo() {
    if (this.url.endsWith('.mp4') || this.url.endsWith('.mov')) {
      if (!this.videoEl || !(this.videoEl instanceof ScomVideo)) {
        this.videoEl = <i-video width={'100%'} height={'100%'} display="block"></i-video>;
        this.pnlVideo.clearInnerHTML();
        this.pnlVideo.append(this.videoEl);
        this.videoEl.url = this.url;
      }
    }
    else if (this.ism3u8) {
      if (!this.videoEl || !(this.videoEl instanceof ScomVideo)) {
        this.videoEl = <i-video isStreaming={true} width={'100%'} height={'100%'} display="block"></i-video>;
        this.pnlVideo.clearInnerHTML();
        this.pnlVideo.append(this.videoEl);
        this.videoEl.url = this.url;
      }
    }
    else {// should be YouTube
      if (!this.videoEl || !(this.videoEl instanceof Iframe)) {
        this.videoEl = <i-iframe width="100%" height="100%" display="flex" allowFullscreen={true}></i-iframe>;
        this.pnlVideo.clearInnerHTML();
        this.pnlVideo.append(this.videoEl);
        this.videoEl.url = this.model.getUrl();
      }
    }
  }

  private initModel() {
    if (!this.model) {
      this.model = new Model(this);
      this.model.updateWidget = this.updateVideo.bind(this);
    }
  }

  async init() {
    this.initModel();
    super.init();
    if (!this.onClick) this.onClick = (target: Control, event: Event) => event.stopPropagation();
    const width = this.getAttribute('width', true);
    const height = this.getAttribute('height', true);
    this.setTag({ width: width ? this.width : '480px', height: height ? this.height : '270px' });
    const lazyLoad = this.getAttribute('lazyLoad', true, false);
    if (!lazyLoad) {
      const url = this.getAttribute('url', true);
      if (url) await this.setData({ url });
    }
  }

  render() {
    return (
      <i-panel id="pnlVideo" width={'100%'} height={'100%'}></i-panel>
    )
  }
}
