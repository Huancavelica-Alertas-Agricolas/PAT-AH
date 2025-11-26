declare module 'virtual:pwa-register' {
  export function registerSW(options?: {
    onRegistered?: (r?: any) => void;
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
    immediate?: boolean;
  }): (reloadPage?: boolean) => void;
  export default registerSW;
}
