declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initDataUnsafe?: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
          };
        };
        ready: () => void;
        expand: () => void;
      };
    };
  }
}

export function useTelegram() {
  const webApp = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;

  return {
    webApp,
    user: webApp?.initDataUnsafe?.user,
    ready: () => webApp?.ready(),
    expand: () => webApp?.expand(),
  };
}