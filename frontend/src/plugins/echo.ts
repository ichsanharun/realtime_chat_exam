import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: any;
  }
}

window.Pusher = Pusher;

export const initEcho = () => {
  const token = localStorage.getItem('token');
  
  // If echo already exists, just update the auth header and return it
  if (window.Echo) {
    if (token) {
      window.Echo.connector.options.auth.headers.Authorization = `Bearer ${token}`;
    }
    return window.Echo;
  }

  if (!token) {
    console.warn('Echo initialization attempted without a token.');
  }

  window.Echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST || '127.0.0.1',
    wsPort: import.meta.env.VITE_REVERB_PORT || 8080,
    wssPort: import.meta.env.VITE_REVERB_PORT || 8080,
    forceTLS: import.meta.env.VITE_REVERB_SCHEME === 'https',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: `${import.meta.env.VITE_API_URL}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      },
    },
  });
  
  console.log('Echo initialized with endpoint:', window.Echo.connector.options.authEndpoint);
  
  return window.Echo;
};
