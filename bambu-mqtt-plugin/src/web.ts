import { WebPlugin } from '@capacitor/core';

import type { BambuPrinterPlugin } from './definitions';

export class BambuPrinterWeb extends WebPlugin implements BambuPrinterPlugin {
  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
  }
}
