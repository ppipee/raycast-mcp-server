export interface WriteRegistryServerParams {
  name: string;
  command: string;
  args: string[];
  env: Record<string, string>;
}
