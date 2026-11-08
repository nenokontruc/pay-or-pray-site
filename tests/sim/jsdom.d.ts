// Minimal typing for the parts of jsdom the legacy harness uses (avoids adding @types/jsdom).
declare module 'jsdom' {
  export class VirtualConsole {
    on(event: string, cb: (...args: unknown[]) => void): this
  }
  export interface ConstructorOptions {
    url?: string
    runScripts?: 'dangerously' | 'outside-only'
    pretendToBeVisual?: boolean
    virtualConsole?: VirtualConsole
    beforeParse?: (window: Window & typeof globalThis) => void
  }
  export class JSDOM {
    constructor(html: string, options?: ConstructorOptions)
    readonly window: Window & typeof globalThis
  }
}
