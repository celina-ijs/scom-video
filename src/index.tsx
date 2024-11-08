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
import { BlockNoteSpecs, callbackFnType, executeFnType } from '@scom/scom-blocknote-sdk';
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
export default class ScomVideo extends Module implements BlockNoteSpecs {
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

  addBlock(blocknote: any, executeFn: executeFnType, callbackFn?: callbackFnType) {
    const findRegex = /(?:https?:\/\/\S+\.(?:mp4|webm|mov|ogg|m3u8))|(?:https:\/\/(?:www\.|m\.)?(youtu.*be.*)\/(?:watch\?v=|embed\/|v|shorts|)(.*?((?=[&#?])|$)))/g;
    function getData(element: HTMLElement) {
      const url = element.getAttribute('href')
      if (url) {
        const match = findRegex.test(url);
        findRegex.lastIndex = 0;
        if (match) {
          return { url };
        }
      }
      return false;
    }

    const VideoBlock = blocknote.createBlockSpec({
      type: "video",
      propSchema: {
        ...blocknote.defaultProps,
        url: {default: ''},
        width: {default: 512},
        height: {default: 'auto'}
      },
      content: "none"
    },
    {
      render: (block: any) => {
        const wrapper = new Panel();
        const { url } = JSON.parse(JSON.stringify(block.props));
        const customElm = new ScomVideo(wrapper, { url })
        if (typeof callbackFn === 'function') callbackFn(customElm, block);
        wrapper.appendChild(customElm);
        return {
          dom: wrapper
        };
      },
      parseFn: () => {
        return [
          {
            tag: "div[data-content-type=video]",
            node: 'video'
          },
          {
            tag: "a",
            getAttrs: (element: string|HTMLElement) => {
              if (typeof element === "string") return false;
              return getData(element);
            },
            priority: 404,
            node: 'video'
          },
          {
            tag: "p",
            getAttrs: (element: string|HTMLElement) => {
              if (typeof element === "string") return false;
              const child = element.firstChild as HTMLElement;
              if (child?.nodeName === 'A') {
                return getData(child);
              }
              return false;
            },
            priority: 405,
            node: 'video'
          }
        ]
      },
      toExternalHTML: (block: any, editor: any) => {
        const link = document.createElement("a");
        const url = block.props.url || "";
        link.setAttribute("href", url);
        link.textContent = 'video';
        const wrapper = document.createElement("p");
        wrapper.appendChild(link);
        return {
          dom: wrapper
        }
      },
      pasteRules: [
        {
          find: findRegex,
          handler(props: any) {
            const { state, chain, range } = props;
            const textContent = state.doc.resolve(range.from).nodeAfter?.textContent;
            chain().BNUpdateBlock(state.selection.from, {
              type: "video",
              props: {
                url: textContent
              },
            }).setTextSelection(range.from + 1);
          }
        }
      ]
    });
    const VideoSlashItem = {
      name: "Video",
      execute: (editor: any) => {
        const block = { type: "video", props: { url: "" }};
        if (typeof executeFn === 'function') executeFn(editor, block);
      },
      aliases: ["video", "media"]
    }  

    return { block: VideoBlock, slashItem: VideoSlashItem };
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
