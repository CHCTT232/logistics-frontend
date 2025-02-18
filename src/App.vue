<template>
  <router-view />
</template>

<script setup>
// App.vue 是应用的根组件
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  height: 100vh;
  width: 100vw;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  overflow-x: hidden;
}

#app {
  height: 100vh;
  width: 100vw;
}

.el-container {
  height: 100%;
}

.el-main {
  padding: 20px;
  background-color: #f5f7fa;
}

.el-card {
  margin-bottom: 20px;
}

.el-card__header {
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
  box-sizing: border-box;
}

.el-table {
  margin-top: 15px;
}

.el-pagination {
  margin-top: 15px;
  text-align: right;
}

.search-form {
  margin-bottom: 15px;
}

.button-group {
  margin-bottom: 15px;
}

.button-group .el-button {
  margin-right: 10px;
}

.chart-container {
  height: 400px;
}
</style> 