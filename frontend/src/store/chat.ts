import { defineStore } from 'pinia';
import api from '../plugins/axios';

export const useChatStore = defineStore('chat', {
  state: () => ({
    chats: [] as any[],
    activeChatId: null as number | null
  }),
  actions: {
    async fetchChats() {
      const { data } = await api.get('/chats');
      this.chats = data;
    },
    async createChat(payload: any) {
      const { data } = await api.post('/chats', payload);
      this.chats.push(data);
      return data;
    },
    setActiveChat(id: number) {
      this.activeChatId = id;
    }
  }
});
