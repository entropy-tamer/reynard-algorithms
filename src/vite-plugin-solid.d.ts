declare module 'vite-plugin-solid' {
  import { Plugin } from 'vite';
  const solid: (options?: any) => Plugin;
  export default solid;
}
