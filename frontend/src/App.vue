<template>
  <n-config-provider :theme="themeStore.isDark ? darkTheme : null">
    <n-global-style />
    <n-message-provider>
      <router-view></router-view>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { NConfigProvider, NMessageProvider, NGlobalStyle, darkTheme } from 'naive-ui'
import { useThemeStore } from './store/theme'

const themeStore = useThemeStore()
</script>
