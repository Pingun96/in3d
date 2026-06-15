import { registerPlugin } from '@capacitor/core';

import type { BambuPrinterPlugin } from './definitions';

const BambuPrinter = registerPlugin<BambuPrinterPlugin>('BambuPrinter', {
  web: () => import('./web').then((m) => new m.BambuPrinterWeb()),
});

export * from './definitions';
export { BambuPrinter };
