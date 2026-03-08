<template>
  <n-layout has-sider style="height: 100vh;">
    <!-- Sidebar / Chat List -->
    <n-layout-sider
      bordered
      collapse-mode="width"
      :collapsed-width="0"
      :width="320"
      show-trigger="bar"
      :native-scrollbar="false"
    >
      <n-layout style="height: 100%;">
        <n-layout-header bordered style="padding: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
          <n-h2 style="margin: 0;">RTChat</n-h2>
          <div style="display: flex; gap: 8px;">
            <n-button circle size="small" @click="themeStore.toggleTheme" title="Toggle Theme">
              <span v-if="themeStore.isDark">☀️</span>
              <span v-else>🌙</span>
            </n-button>
            <n-button circle size="small" @click="$router.push('/api-logs')" title="Logs">
              L
            </n-button>
            <n-button circle size="small" type="error" @click="handleLogout" title="Logout">
              X
            </n-button>
          </div>
        </n-layout-header>
        
        <n-layout-content style="padding: 1rem;" :native-scrollbar="false">
          <n-button block dashed style="margin-bottom: 1rem;" @click="showNewChatModal = true">
            + New Chat
          </n-button>
          <n-menu :options="chatOptions" :value="chatStore.activeChatId" @update:value="selectChat" />
        </n-layout-content>
      </n-layout>
    </n-layout-sider>

    <!-- Main Chat Area -->
    <n-layout style="height: 100vh;">
      <template v-if="chatStore.activeChatId">
        <n-layout-header 
          bordered 
          position="absolute"
          style="height: 80px; padding: 1.5rem; display: flex; justify-content: space-between; align-items: center;"
        >
          <n-h3 style="margin: 0;">{{ activeChatName }}</n-h3>
          <n-tag type="info" size="small">{{ activeChat?.type }}</n-tag>
        </n-layout-header>
        
        <n-layout-content 
          position="absolute"
          style="top: 80px; bottom: 90px; padding: 1.5rem;" 
          ref="messagesContainer" 
          :native-scrollbar="false"
        >
          <div style="display: flex; flex-direction: column; gap: 1rem; min-height: 100%; justify-content: flex-end;">
            <div 
              v-for="msg in messageStore.messages" 
              :key="msg.id" 
              class="message-bubble"
              :class="{ 'is-mine': msg.user_id === authStore.user?.id, 'is-other': msg.user_id !== authStore.user?.id }"
            >
              <div class="message-sender" v-if="msg.user_id !== authStore.user?.id">
                {{ msg.user?.name || 'User' }}
              </div>
              <div class="message-text">{{ msg.message }}</div>
              <div class="message-time">{{ new Date(msg.created_at).toLocaleTimeString() }}</div>
            </div>
          </div>
        </n-layout-content>

        <n-layout-footer 
          bordered 
          position="absolute"
          style="height: 90px; padding: 1.5rem; bottom: 0;"
        >
          <n-input-group>
            <n-input 
              v-model:value="newMessage" 
              placeholder="Type a message..." 
              @keyup.enter="sendMessage"
            />
            <n-button type="primary" :loading="sending" @click="sendMessage">
              Send
            </n-button>
          </n-input-group>
        </n-layout-footer>
      </template>
      
      <template v-else>
        <div class="empty-state">
          <n-empty description="Select a chat to start messaging">
            <template #extra>
              <n-button size="small" @click="showNewChatModal = true">Create New Chat</n-button>
            </template>
          </n-empty>
        </div>
      </template>
    </n-layout>

    <!-- New Chat Modal -->
    <n-modal v-model:show="showNewChatModal" preset="card" title="Create New Chat" style="max-width: 400px">
      <n-form @submit.prevent="createChat">
        <n-form-item label="Chat Type">
          <n-radio-group v-model:value="newChatForm.type" name="chatType">
            <n-space>
              <n-radio value="private">Private</n-radio>
              <n-radio value="group">Group</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>
        
        <n-form-item label="Select Member(s)">
          <n-select 
            v-model:value="newChatForm.member_ids" 
            multiple 
            :options="userOptions" 
            placeholder="Select users to chat with"
          />
        </n-form-item>
        
        <n-button type="primary" block @click="createChat" :loading="creating">Start Chat</n-button>
      </n-form>
    </n-modal>
  </n-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';
import { useChatStore } from '../store/chat';
import { useThemeStore } from '../store/theme';
import { useMessageStore } from '../store/message';
import api from '../plugins/axios';

const router = useRouter();
const authStore = useAuthStore();
const chatStore = useChatStore();
const themeStore = useThemeStore();
const messageStore = useMessageStore();

const messagesContainer = ref<any>(null);
const newMessage = ref('');
const sending = ref(false);

const showNewChatModal = ref(false);
const creating = ref(false);
const newChatForm = ref({
  type: 'private',
  member_ids: [] as number[],
});
const users = ref<any[]>([]);

// Computed Properties
const chatOptions = computed(() => {
  return chatStore.chats.map(c => {
    let name = `Chat #${c.id}`;
    if (c.type === 'private') {
      const other = c.members.find((m: any) => m.user_id !== authStore.user?.id);
      name = other ? other.user.name : 'Unknown';
    } else {
      name = `Group (${c.members.length} members)`;
    }
    return {
      label: name,
      key: c.id
    };
  });
});

const userOptions = computed(() => {
  return users.value
    .filter(u => u.id !== authStore.user?.id)
    .map(u => ({
      label: u.name,
      value: u.id
    }));
});

const activeChat = computed(() => {
  return chatStore.chats.find(c => c.id === chatStore.activeChatId);
});

const activeChatName = computed(() => {
  const c = activeChat.value;
  if (!c) return '';
  if (c.type === 'private') {
    const other = c.members.find((m: any) => m.user_id !== authStore.user?.id);
    return other ? other.user.name : 'Private Chat';
  }
  return `Group Chat`;
});

// Methods
const fetchUsers = async () => {
    const { data } = await api.get('/users');
    users.value = data;
};

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

const selectChat = async (id: number) => {
  if (chatStore.activeChatId) {
    messageStore.leaveChannel(chatStore.activeChatId);
  }
  chatStore.setActiveChat(id);
  await messageStore.fetchMessages(id);
  scrollToBottom();
};

const sendMessage = async () => {
  if (!newMessage.value.trim() || !chatStore.activeChatId) return;
  sending.value = true;
  try {
    await messageStore.sendMessage(chatStore.activeChatId, newMessage.value);
    newMessage.value = '';
    scrollToBottom();
  } catch(e) {
    console.error(e);
  } finally {
    sending.value = false;
  }
};

const createChat = async () => {
  if (!newChatForm.value.member_ids.length) return alert('Select at least one member');
  creating.value = true;
  try {
    const chat = await chatStore.createChat(newChatForm.value);
    showNewChatModal.value = false;
    newChatForm.value.member_ids = [];
    selectChat(chat.id);
  } catch(e) {
    console.error(e);
  } finally {
    creating.value = false;
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    messagesContainer.value?.scrollTo({ top: Number.MAX_SAFE_INTEGER, behavior: 'smooth' })
  });
};

watch(() => messageStore.messages.length, () => {
  scrollToBottom();
});

onMounted(async () => {
  await chatStore.fetchChats();
  await fetchUsers();
});
</script>

<style scoped>
.empty-state {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.message-bubble {
  max-width: 70%;
  padding: 0.8rem 1.2rem;
  border-radius: 12px;
  align-self: flex-start;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

/* Light mode overrides handled dynamically but we can structure some default css vars using naive ui variables if needed, 
   instead we'll rely on the default background and color via is-mine and is-other styling */
.message-bubble.is-other {
  background-color: var(--n-color-embedded);
  border: 1px solid var(--n-border-color);
}

.message-bubble.is-mine {
  align-self: flex-end;
  background-color: var(--n-primary-color);
  color: #fff;
}

.message-sender {
  font-size: 0.75rem;
  font-weight: 600;
  opacity: 0.7;
  margin-bottom: 0.2rem;
}

.message-text {
  font-size: 0.95rem;
  line-height: 1.4;
}

.message-time {
  font-size: 0.65rem;
  opacity: 0.7;
  text-align: right;
  margin-top: 0.4rem;
}
</style>
