import { Module, customModule, Container } from '@ijstech/components';
import ScomVideo from '@scom/scom-video';
import ScomWidgetTest from '@scom/scom-widget-test';
@customModule
export default class Module1 extends Module {
    private videoElm: ScomVideo;
    private widgetModule: ScomWidgetTest;

    constructor(parent?: Container, options?: any) {
        super(parent, options);
    }

    private async onShowConfig() {
        const editor = this.videoElm.getConfigurators().find(v => v.target === 'Editor');
        const widgetData = await editor.getData();
        if (!this.widgetModule) {
            this.widgetModule = await ScomWidgetTest.create({
                widgetName: 'scom-video',
                onConfirm: (data: any, tag: any) => {
                    editor.setData(data);
                    editor.setTag(tag);
                    this.widgetModule.closeModal();
                }
            });
        }
        this.widgetModule.openModal({
            width: '90%',
            maxWidth: '90rem',
            minHeight: 370,
            padding: { top: 0, bottom: 0, left: 0, right: 0 },
            closeOnBackdropClick: true,
            closeIcon: null
        });
        this.widgetModule.show(widgetData);
    }

    async init() {
        super.init();
    }

    render() {
        return <i-panel>
            <i-vstack
                margin={{ top: '1rem', left: '1rem', right: '1rem' }}
                gap="1rem"
                alignItems="center"
            >
                <i-button caption="Config" onClick={this.onShowConfig} width={160} padding={{ top: 5, bottom: 5 }} margin={{ left: 'auto', right: 20 }} font={{ color: '#fff' }} />
                <i-scom-video
                    id="videoElm"
                    url='https://static.flot.ai/file/karavideo/happy-cat.mp4'
                />
            </i-vstack>
        </i-panel>
    }
}