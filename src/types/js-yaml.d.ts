declare module 'js-yaml' {
  export function load(input: string): unknown
  export function dump(input: unknown, options?: { indent?: number; noRefs?: boolean; lineWidth?: number }): string
}
