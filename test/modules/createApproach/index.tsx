import { Module, customModule, Container, VStack } from '@ijstech/components';
import ScomImage from '@scom/scom-video'
@customModule
export default class Module1 extends Module {
    private mainStack: VStack;

    constructor(parent?: Container, options?: any) {
        super(parent, options);
    }

    async init() {
        super.init();
        await ScomImage.create({
           url: 'https://hips.hearstapps.com/hmg-prod/images/summer-flowers-star-flower-1648071187.jpg',
           width: 300,
           height: 200
        }, this.mainStack);
    }

    render() {
        return <i-panel>
            <i-hstack id="mainStack" margin={{top: '1rem', left: '1rem'}} gap="2rem">
            </i-hstack>
        </i-panel>
    }
}