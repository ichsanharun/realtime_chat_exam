<template>
  <div class="auth-container">
    <div class="theme-toggle">
      <n-switch :value="themeStore.isDark" @update:value="themeStore.toggleTheme">
        <template #checked>Dark</template>
        <template #unchecked>Light</template>
      </n-switch>
    </div>
    <n-card class="auth-card" title="Login" embedded>
      <n-form @submit.prevent="handleLogin" :model="form">
        <n-form-item label="Email" path="email">
          <n-input v-model:value="form.email" placeholder="Enter your email" type="email" />
        </n-form-item>
        <n-form-item label="Password" path="password">
          <n-input v-model:value="form.password" type="password" placeholder="Enter your password" show-password-on="click" />
        </n-form-item>
        
        <n-button type="primary" block attr-type="submit" :loading="loading">
          Sign In
        </n-button>
      </n-form>
      
      <div class="auth-links">
        <n-text>Don't have an account? </n-text>
        <n-button text type="primary" @click="$router.push('/register')">Register Now</n-button>
      </div>
    </n-card>

    <n-modal v-model:show="show2faModal" preset="card" title="Two-Factor Authentication" style="max-width: 400px">
      <n-form @submit.prevent="handleVerify2fa">
        <n-form-item label="Authentication Code">
          <n-input v-model:value="otp" placeholder="6-digit authenticator code" />
        </n-form-item>
        <n-button type="primary" block attr-type="submit" :loading="loading">Verify</n-button>
      </n-form>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';
import { useThemeStore } from '../store/theme';
import { useMessage } from 'naive-ui';

const router = useRouter();
const authStore = useAuthStore();
const themeStore = useThemeStore();

// Setup message context
let message: any;
try {
  message = useMessage();
} catch (e) {
  // If useMessage lacks context because we're not inside n-message-provider hook
  message = { error: alert, success: console.log };
}

const form = ref({ email: '', password: '' });
const loading = ref(false);
const show2faModal = ref(false);
const otp = ref('');

const handleLogin = async () => {
  if (!form.value.email || !form.value.password) return message.error('Please fill all fields');
  loading.value = true;
  try {
    const res = await authStore.login(form.value);
    if (res.requires_2fa) {
      show2faModal.value = true;
    } else {
      message.success('Login successful');
      router.push('/chat');
    }
  } catch (error: any) {
    message.error(error.response?.data?.error || 'Login failed');
  } finally {
    loading.value = false;
  }
};

const handleVerify2fa = async () => {
  if (!otp.value) return message.error('Enter OTP');
  loading.value = true;
  try {
    await authStore.verify2fa(otp.value);
    message.success('Verified successfully');
    show2faModal.value = false;
    router.push('/chat');
  } catch (error: any) {
    message.error(error.response?.data?.error || 'Invalid code');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  position: relative;
}
.theme-toggle {
  position: absolute;
  top: 1rem;
  right: 1rem;
}
.auth-card {
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
}
.auth-links {
  margin-top: 1rem;
  text-align: center;
}
</style>
