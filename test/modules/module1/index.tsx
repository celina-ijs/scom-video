import { Module, customModule, Container, VStack } from '@ijstech/components';
import ScomVideo from '@scom/scom-video'
@customModule
export default class Module1 extends Module {
    private videoElm: ScomVideo;
    private mainStack: VStack;

    constructor(parent?: Container, options?: any) {
        super(parent, options);
    }

    async init() {
        super.init();
        this.videoElm = await ScomVideo.create({
            id: 'video2',
            url: 'dQw4w9WgXcQ'
        });
        this.mainStack.appendChild(this.videoElm);
    }

    render() {
        return <i-panel>
            <i-hstack id="mainStack" margin={{ top: '1rem', left: '1rem' }} gap="2rem">
                <i-scom-video
                    id="video1"
                    url='dQw4w9WgXcQ'
                    width={500}
                    height={300}
                ></i-scom-video>
            </i-hstack>
        </i-panel>
    }
}