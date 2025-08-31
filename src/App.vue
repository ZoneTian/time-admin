<script setup lang="ts">
import { RouterView, useRoute, useRouter } from 'vue-router'
import { ref, watch, computed } from 'vue'
import { User, Calendar, Fold, Expand } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const activeMenu = ref(route.path)
watch(() => route.path, (val) => {
  activeMenu.value = val
})

const isLoginPage = computed(() => route.path === '/login')

const handleMenuSelect = (index: string) => {
  if (index !== route.path) {
    router.push(index)
  }
}

const collapsed = ref(false)
const toggleCollapse = () => {
  collapsed.value = !collapsed.value
}
</script>

<template>
  <router-view />
</template>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  min-width: 0;
  min-height: 0;
  background: #181818;
}
.side-bar {
  display: flex;
  flex-direction: column;
  width: 200px;
  min-width: 60px;
  height: 100vh;
  background: #23272e;
  transition: width 0.2s;
}
.side-bar.collapsed {
  width: 60px;
}
.logo-area {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: #23272e;
  border-bottom: 1px solid #222;
  box-sizing: border-box;
}
.logo-text {
  color: #ffd04b;
  font-size: 1.5rem;
  font-weight: bold;
  letter-spacing: 2px;
}
.logo-text-collapsed {
  color: #ffd04b;
  font-size: 1.5rem;
  font-weight: bold;
}
.collapse-btn {
  margin-left: 8px;
  color: #fff;
}
.side-menu {
  flex: 1;
  border-right: none;
  background: #23272e;
}
.main-content {
  flex: 1;
  width: 100%;
  min-width: 0;
  background: #181818;
  min-height: 100vh;
  overflow: auto;
  box-sizing: border-box;
  color: #f1f1f1;
}
.el-menu-item {
  font-size: 1.1rem;
  transition: background 0.2s, color 0.2s;
}
.el-menu-item.is-active {
  background-color: #334155 !important;
  color: #ffd04b !important;
}
.el-menu-item:not(.is-active) {
  color: #f1f1f1;
}
</style>
