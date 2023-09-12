import { Styles } from '@ijstech/components';
const Theme = Styles.Theme.ThemeVars;

Styles.cssRule('i-scom-video', {
  $nest: {
    '#pnlModule': {
      height: '100%'
    },
    '.video-js  .vjs-big-play-button': {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    }
  }
});
