import { defineStore } from 'pinia';
import api from '../plugins/axios';
import { initEcho } from '../plugins/echo';

export const useMessageStore = defineStore('message', {
  state: () => ({
    messages: [] as any[],
  }),
  actions: {
    async fetchMessages(chatId: number) {
      const { data } = await api.get(`/chats/${chatId}/messages`);
      this.messages = data;
      this.listenForMessages(chatId);
    },
    async sendMessage(chatId: number, message: string) {
      const { data } = await api.post('/messages', { chat_id: chatId, message });
      // The push is removed from here because the broadcast will echo it back to the sender as well if we don't ignore ourselves.
      // Laravel Echo `toOthers()` prevents broadcasting to the sender. So we SHOULD push it here.
      this.messages.push(data);
      return data;
    },
    listenForMessages(chatId: number) {
      const echo = initEcho();
      console.log(`Subscribing to chat.${chatId}...`);
      
      echo.private(`chat.${chatId}`)
        .listen('.MessageSent', (e: any) => {
          console.log('New message received via WebSocket:', e.message);
          // Prevent duplicates
          if (!this.messages.find(m => m.id === e.message.id)) {
             this.messages.push(e.message);
          }
        })
        .error((err: any) => {
          console.error('WebSocket Channel Subscription error:', err);
        });
    },
    leaveChannel(chatId: number) {
      const echo = initEcho();
      echo.leave(`chat.${chatId}`);
    }
  }
});
