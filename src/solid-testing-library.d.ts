declare module '@solidjs/testing-library' {
  export function cleanup(): void;
  export function render(ui: any, options?: any): any;
  export function renderHook(callback: any, options?: any): any;
  export const screen: any;
  export function waitFor(callback: any, options?: any): Promise<any>;
}
