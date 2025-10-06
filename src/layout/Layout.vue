<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { onMounted, onUnmounted } from "vue";
import { ref, watch, markRaw } from "vue";
import {
  User,
  Calendar,
  Fold,
  Expand,
  HomeFilled,
} from "@element-plus/icons-vue";
import MemberListView from "../views/MemberListView.vue";
import ActivityListView from "../views/ActivityListView.vue";
import MemberDetailView from "../views/MemberDetailView.vue";
import ActivityDetailView from "../views/ActivityDetailView.vue";
import ActivityEditView from "../views/ActivityEditView.vue";
import DashboardView from "../views/DashboardView.vue";
import eventBus from "../eventBus";
import type { DetailRow } from "../eventBus";
import axios from "axios";
import { BASE_API_URL } from "../constants/api";
import { ElMessage } from "element-plus";

const route = useRoute();
const router = useRouter();
const username = ref(localStorage.getItem("username") || "admin");
const token = ref(localStorage.getItem("token") || "");

// 处理下拉菜单命令
const handleCommand = async (command: string) => {
  if (command === "logout") {
    try {
      // 调用登出接口
      if (token.value) {
        await axios.post(`${BASE_API_URL}/user/logout`, {}, {}).catch((err) => {
          console.warn("登出接口调用失败，可能服务端未实现此接口", err);
        });
      }
    } catch (error) {
      console.error("登出时发生错误:", error);
    } finally {
      // 无论登出接口是否成功，都清除本地登录状态
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("username");
      localStorage.removeItem("token");
      // 跳转到登录页
      router.push("/login");
    }
  }
};

// 设置全局请求拦截器，自动添加token到请求头
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["api-access-token"] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 设置全局响应拦截器，处理token过期等情况
axios.interceptors.response.use(
  (response) => {
    // 检查响应中是否有token过期或需要重定向的标识
    if (
      response.data &&
      (response.data.code === 401 ||
        response.data.code === 302 || // 添加302重定向码
        response.data.code === 10001 || // 假设10001是token过期的错误码
        (response.data.message && response.data.message.includes("token"))) // 检查错误消息是否包含token
    ) {
      // 显示提示
      ElMessage.error(response.data.message || "Token已过期，请重新登录");

      // 清除登录状态
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("username");
      localStorage.removeItem("token");

      // 跳转到登录页
      router.push("/login");
      return Promise.reject(new Error("需要重新登录"));
    }
    return response;
  },
  (error) => {
    // 处理网络错误、请求被拒绝等情况
    if (error.response) {
      // 服务器返回了错误状态码
      if (error.response.status === 401 || error.response.status === 403) {
        // token过期、无效或权限不足
        ElMessage.error("登录已过期，请重新登录");

        // 清除登录状态
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("username");
        localStorage.removeItem("token");

        // 跳转到登录页
        router.push("/login");
      } else if (error.response.status === 500) {
        ElMessage.error("服务器错误，请稍后再试");
      } else {
        ElMessage.error(`请求失败: ${error.response.status}`);
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      ElMessage.error("服务器无响应，请检查网络连接");
    } else {
      // 请求配置出错
      ElMessage.error("请求错误，请稍后再试");
    }
    return Promise.reject(error);
  }
);

interface TabItem {
  title: string;
  name: string;
  component: any;
  closable: boolean;
  params?: Record<string, any>;
}

// tab 列表，包含固定和动态tab
const tabs = ref<TabItem[]>([
  {
    title: "首页",
    name: "/dashboard",
    component: markRaw(DashboardView),
    closable: false,
  },
]);
const activeTab = ref(
  route.path.startsWith("/member/") ? `/member/${route.params.id}` : route.path
);

// 获取默认激活的菜单项
const getDefaultActive = () => {
  if (route.path.startsWith("/member/")) {
    return "/member";
  } else if (
    route.path.startsWith("/activity/") ||
    route.path.startsWith("/activity-edit/") ||
    route.path.startsWith("/activity-create")
  ) {
    return "/activity";
  } else {
    return route.path;
  }
};

// 动态添加tab
function addTab(tab: TabItem) {
  if (!tabs.value.find((t) => t.name === tab.name)) {
    tab.component = markRaw(tab.component);
    tabs.value.push(tab);
  }
  activeTab.value = tab.name;
}

// 监听eventBus事件
onMounted(() => {
  // 移除对open-member-detail的监听，因为我们已经通过组件事件处理它
  // eventBus.on('open-member-detail', handleOpenMemberDetail)
  eventBus.on("open-activity-detail", handleOpenActivityDetail);
  eventBus.on("open-activity-create", handleOpenActivityCreate);
  eventBus.on("open-activity-edit", handleOpenActivityEdit);
  eventBus.on("close-current-tab", handleCloseTab);
});
onUnmounted(() => {
  // eventBus.off('open-member-detail', handleOpenMemberDetail)
  eventBus.off("open-activity-detail", handleOpenActivityDetail);
  eventBus.off("open-activity-create", handleOpenActivityCreate);
  eventBus.off("open-activity-edit", handleOpenActivityEdit);
  eventBus.off("close-current-tab", handleCloseTab);
});

// 处理关闭标签页事件
function handleCloseTab(tabName: string) {
  console.log("关闭标签页:", tabName);
  removeTab(tabName);
}

function handleOpenMemberDetail(row: DetailRow) {
  const tabName = `/member/${row.id}`;
  const title = `用户详情-${row.nickname || row.name || row.id}`;
  addTab({
    title,
    name: tabName,
    component: markRaw(MemberDetailView),
    closable: true,
    params: { id: Number(row.id) },
  });
  activeTab.value = tabName;
  router.push(tabName);
}

function handleOpenActivityDetail(row: DetailRow) {
  const tabName = `/activity/${row.id}`;
  const title = `活动详情-${row.title || row.id}`;
  addTab({
    title,
    name: tabName,
    component: markRaw(ActivityDetailView),
    closable: true,
    params: { id: Number(row.id) },
  });
  activeTab.value = tabName;
  router.push(tabName);
}

function handleOpenActivityCreate() {
  const tabName = "/activity-edit";
  const title = "创建活动";
  addTab({
    title,
    name: tabName,
    component: markRaw(ActivityEditView),
    closable: true,
  });
  activeTab.value = tabName;
  router.push(tabName);
}

function handleOpenActivityEdit(row: DetailRow) {
  const id = row.id;
  if (!id) {
    console.error("活动ID不能为空2");
    return;
  }

  console.log("编辑活动:", row);
  console.log("活动ID:", id);

  const tabName = `/activity-edit/${id}`;
  const title = `编辑活动-${row.activityTitle || id}`;
  addTab({
    title,
    name: tabName,
    component: markRaw(ActivityEditView),
    closable: true,
    params: { id: Number(id) },
  });
  activeTab.value = tabName;
  router.push(tabName);
}

watch(
  () => route.fullPath,
  (val) => {
    if (val === "/member" || val === "/activity" || val === "/dashboard") {
      activeTab.value = val;
    } else if (val.startsWith("/member/")) {
      const id = Number(route.params.id);
      const name = route.params.name;
      const title = `用户详情-${name || id}`;
      addTab({
        title,
        name: `/member/${id}`,
        component: markRaw(MemberDetailView),
        closable: true,
        params: { id },
      });
      activeTab.value = `/member/${id}`;
    } else if (val.startsWith("/activity/")) {
      const id = Number(route.params.id);
      const title = `活动详情-${id}`;
      addTab({
        title,
        name: `/activity/${id}`,
        component: markRaw(ActivityDetailView),
        closable: true,
        params: { id },
      });
      activeTab.value = `/activity/${id}`;
    } else if (val === "/activity-edit") {
      // 处理创建活动的情况
      const title = "创建活动";
      addTab({
        title,
        name: "/activity-edit",
        component: markRaw(ActivityEditView),
        closable: true,
      });
      activeTab.value = "/activity-edit";
    } else if (val.startsWith("/activity-edit/")) {
      // 处理编辑活动的情况
      const id = Number(route.params.id);
      const title = `编辑活动-${id}`;
      addTab({
        title,
        name: `/activity-edit/${id}`,
        component: markRaw(ActivityEditView),
        closable: true,
        params: { id },
      });
      activeTab.value = `/activity-edit/${id}`;
    }
  },
  { immediate: true }
);

// tab 切换时同步路由
function handleTabClick(tab: any) {
  if (tab.props.name !== route.path) {
    activeTab.value = tab.props.name;
    router.push(tab.props.name);
  }
}

// 关闭tab
function removeTab(name: string) {
  console.log("关闭标签:", name);
  const idx = tabs.value.findIndex((t) => t.name === name);
  if (idx > -1) {
    // 如果要关闭的是当前激活的标签，先切换到其他标签
    if (activeTab.value === name) {
      const next = tabs.value[idx - 1] || tabs.value[0];
      if (next) {
        activeTab.value = next.name;
        router.push(next.name);
      }
    }

    // 从数组中移除标签
    tabs.value.splice(idx, 1);

    console.log(
      "关闭后的标签列表:",
      tabs.value.map((t) => t.name)
    );
  }
}

const collapsed = ref(false);
const toggleCollapse = () => {
  collapsed.value = !collapsed.value;
};

const handleMenuSelect = (index: string) => {
  // 如果tab不存在，自动添加
  if (!tabs.value.find((t) => t.name === index)) {
    let tab;
    if (index === "/dashboard") {
      tab = {
        title: "系统概览",
        name: "/dashboard",
        component: markRaw(DashboardView),
        closable: false,
      };
    } else if (index === "/member") {
      tab = {
        title: "用户管理",
        name: "/member",
        component: markRaw(MemberListView),
        closable: false,
      };
    } else if (index === "/activity") {
      tab = {
        title: "活动管理",
        name: "/activity",
        component: markRaw(ActivityListView),
        closable: false,
      };
    } else if (index === "/activity-edit") {
      tab = {
        title: "创建活动",
        name: "/activity-edit",
        component: markRaw(ActivityEditView),
        closable: true,
      };
    }
    if (tab) addTab(tab);
  }
  activeTab.value = index;
  router.push(index);
};
</script>

<template>
  <div class="layout">
    <aside class="side-bar" :class="{ collapsed }">
      <div class="logo-area">
        <span v-if="!collapsed" class="logo-text">我们时刻</span>
        <span v-else class="logo-text-collapsed">我</span>
        <el-button
          class="collapse-btn"
          @click="toggleCollapse"
          text
          circle
          size="small"
        >
          <el-icon>
            <component :is="collapsed ? Expand : Fold" />
          </el-icon>
        </el-button>
      </div>
      <el-menu
        class="side-menu"
        :default-active="getDefaultActive()"
        router
        background-color="#1a2342"
        text-color="#fff"
        active-text-color="#fff"
        @select="handleMenuSelect"
        :collapse="collapsed"
      >
        <el-menu-item index="/dashboard">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </el-menu-item>
        <el-menu-item index="/member">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/activity">
          <el-icon><Calendar /></el-icon>
          <span>活动管理</span>
        </el-menu-item>
      </el-menu>
    </aside>
    <div class="main-content">
      <div class="header-bar">
        <div class="user-info">
          <span>欢迎，{{ username }}</span>
          <el-dropdown @command="handleCommand">
            <span class="el-dropdown-link">
              <el-avatar :size="32" :icon="User" />
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      <el-tabs
        v-model="activeTab"
        type="card"
        @tab-click="handleTabClick"
        @tab-remove="removeTab"
      >
        <el-tab-pane
          v-for="tab in tabs"
          :key="tab.name"
          :label="tab.title"
          :name="tab.name"
          :closable="tab.closable"
        >
          <keep-alive>
            <component
              :is="tab.component"
              v-bind="tab.params || {}"
              @open-member-detail="handleOpenMemberDetail"
              @open-activity-edit="handleOpenActivityEdit"
            />
          </keep-alive>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  height: 100%;
  width: 100%;
  min-width: 0;
  min-height: 0;
  background: #181818;
  overflow: hidden;
}
.side-bar {
  display: flex;
  flex-direction: column;
  width: 200px;
  min-width: 60px;
  height: 100vh;
  background: #1a2342;
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
  background: #1a2342;
  border-bottom: 1px solid #222;
  box-sizing: border-box;
}
.logo-text {
  color: #fff;
  font-size: 1.5rem;
  font-weight: bold;
  letter-spacing: 2px;
}
.logo-text-collapsed {
  color: #fff;
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
  background: #1a2342;
}
.main-content {
  flex: 1;
  width: 100%;
  min-width: 0;
  background: #fff;
  min-height: 100vh;
  overflow: auto;
  box-sizing: border-box;
  color: #222;
  display: flex;
  flex-direction: column;
}
.header-bar {
  width: 100%;
  height: 70px;
  background: #fff;
  margin-bottom: 15px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 30px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px 0;
}

.el-dropdown-link {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 5px;
}
.el-menu-item {
  font-size: 1.1rem;
  transition: background 0.2s, color 0.2s;
  color: #fff !important;
}
.el-menu-item.is-active {
  background-color: #3a5bdb !important;
  color: #fff !important;
}
.el-menu-item:not(.is-active) {
  color: #fff !important;
}
.el-tabs {
  background: transparent;
  flex: 1;
  display: flex;
  flex-direction: column;
}
.el-tab-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
