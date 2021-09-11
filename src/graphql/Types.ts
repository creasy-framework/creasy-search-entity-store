export interface EntityResolver {
  [key: string]: (args: any) => Promise<any>;
}
