export interface EnvParseResult {
  env: Record<string, string>;
  invalidLines: string[];
}
