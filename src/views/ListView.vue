<template>
  <div class="list-container">
    <el-card>
      <h2>用户列表</h2>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="date" label="日期" width="180" />
        <el-table-column prop="name" label="姓名" width="180" />
        <el-table-column prop="address" label="地址" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const tableData = ref([
  { date: '2023-01-01', name: '张三', address: '北京' },
  { date: '2023-01-02', name: '李四', address: '上海' },
  { date: '2023-01-03', name: '王五', address: '广州' },
])
</script>

<style scoped>
.list-container {
  width: 100%;
  height: 100%;
  padding: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
}
.el-card {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style> 