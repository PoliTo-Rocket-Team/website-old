import { watermark, setupNavigation, setupThemePreference } from './utils';

watermark(document.querySelector(".water-mark"));
setupNavigation("main-nav", 70);
setupThemePreference();