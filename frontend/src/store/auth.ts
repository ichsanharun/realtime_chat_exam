import { defineStore } from 'pinia';
import api from '../plugins/axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token') || null as string | null,
    requires2fa: false,
    tempUserId: null as number | null
  }),
  actions: {
    async login(credentials: any) {
      const { data } = await api.post('/auth/login', credentials);
      if (data.requires_2fa) {
        this.requires2fa = true;
        this.tempUserId = data.user_id;
        return { requires_2fa: true };
      }
      this.setAuth(data.user, data.token);
      return data;
    },
    async verify2fa(otp: string) {
      const { data } = await api.post('/auth/verify-2fa', { user_id: this.tempUserId, otp });
      this.setAuth(data.user, data.token);
      this.requires2fa = false;
      this.tempUserId = null;
      return data;
    },
    async register(payload: any) {
      const { data } = await api.post('/auth/register', payload);
      this.setAuth(data.user, data.token);
      return data;
    },
    setAuth(user: any, token: string) {
      this.user = user;
      this.token = token;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    },
    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
});
