<template>
  <div class="auth-container">
    <div class="theme-toggle">
      <n-switch :value="themeStore.isDark" @update:value="themeStore.toggleTheme">
        <template #checked>Dark</template>
        <template #unchecked>Light</template>
      </n-switch>
    </div>
    <n-card class="auth-card" title="Register" embedded v-if="!qrCodeUrl">
      <n-form @submit.prevent="handleRegister" :model="form">
        <n-form-item label="Name" path="name">
          <n-input v-model:value="form.name" placeholder="John Doe" />
        </n-form-item>
        <n-form-item label="Email" path="email">
          <n-input v-model:value="form.email" placeholder="Enter your email" type="email" />
        </n-form-item>
        <n-form-item label="Password" path="password">
          <n-input v-model:value="form.password" type="password" placeholder="Min 6 chars" show-password-on="click" />
        </n-form-item>
        
        <n-button type="primary" block attr-type="submit" :loading="loading">
          Sign Up
        </n-button>
      </n-form>

      <div class="auth-links">
        <n-text>Already have an account? </n-text>
        <n-button text type="primary" @click="$router.push('/login')">Log In here</n-button>
      </div>
    </n-card>

    <n-card class="auth-card text-center" title="Setup 2FA (Optional)" v-else>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 15px;">
        <n-text depth="3">Scan this QR Code with Google Authenticator. Keep it safe!</n-text>
        <img :src="qrCodeStr" alt="2FA QR" style="width: 200px; height: 200px; border: 1px solid #eee; border-radius: 8px;"/>
        <n-alert title="Important" type="warning" :show-icon="false" style="width: 100%">
          Your Manual Key: <b>{{ twoFactorSecret }}</b>
        </n-alert>
        
        <n-button type="primary" block @click="$router.push('/chat')" style="margin-top: 1rem;">
          I've saved it, let's Chat!
        </n-button>
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';
import { useThemeStore } from '../store/theme';
import QRCode from 'qrcode'; // I need to install this

const router = useRouter();
const authStore = useAuthStore();
const themeStore = useThemeStore();

const form = ref({ name: '', email: '', password: '' });
const loading = ref(false);

const qrCodeUrl = ref('');
const qrCodeStr = ref('');
const twoFactorSecret = ref('');

const handleRegister = async () => {
  if (!form.value.name || !form.value.email || !form.value.password) {
    return alert('Please fill all fields');
  }
  loading.value = true;
  try {
    const res = await authStore.register(form.value);
    
    // Convert google2fa raw URL into Data URL image
    if (res.qr_code_url) {
      qrCodeUrl.value = res.qr_code_url;
      twoFactorSecret.value = res.two_factor_secret;
      qrCodeStr.value = await QRCode.toDataURL(res.qr_code_url);
    } else {
      router.push('/chat');
    }
  } catch (error: any) {
    alert(error.response?.data?.message || 'Registration failed');
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
.text-center {
  text-align: center;
}
</style>
