<template>
  <n-layout style="min-height: 100vh; padding: 2rem;">
    <n-card title="API Logs 🛠️" bordered>
      <template #header-extra>
        <div style="display: flex; gap: 8px;">
          <n-button @click="themeStore.toggleTheme" circle title="Toggle Theme">
            <span v-if="themeStore.isDark">☀️</span>
            <span v-else>🌙</span>
          </n-button>
          <n-button @click="$router.push('/chat')" type="primary" dashed>Back to Chat</n-button>
        </div>
      </template>
      
      <n-data-table
        :columns="columns"
        :data="logs"
        :pagination="{ pageSize: 15 }"
        :loading="loading"
        striped
      />
    </n-card>
  </n-layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useThemeStore } from '../store/theme';
import api from '../plugins/axios';

const themeStore = useThemeStore();
const logs = ref([]);
const loading = ref(false);

const columns = [
  { title: 'ID', key: 'id', width: 60 },
  { title: 'Method', key: 'method', width: 90 },
  { title: 'Endpoint', key: 'endpoint' },
  { title: 'Response', key: 'response_status', width: 100 },
  { title: 'IP Address', key: 'ip_address', width: 140 },
  { title: 'Created At', key: 'created_at', width: 200 }
];

onMounted(async () => {
  loading.value = true;
  try {
    const { data } = await api.get('/api-logs');
    logs.value = data;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
});
</script>
