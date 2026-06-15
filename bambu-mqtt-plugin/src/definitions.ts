export interface BambuPrinterPlugin {
  echo(options: { value: string }): Promise<{ value: string }>;
}
