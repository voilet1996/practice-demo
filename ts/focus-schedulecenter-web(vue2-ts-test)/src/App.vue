<template>
  <div id="app">
    <!-- <div id="nav">
      <router-link to="/Home">首页</router-link> |
      <router-link to="/JobManagement">任务管理</router-link>|
      <router-link to="/JobScheduling">任务排期</router-link> |
      <router-link to="/RunningHistory">运行历史</router-link>|
      <router-link to="/ExecutorManagement">执行器管理</router-link> |
    </div> -->
    <router-view />
  </div>
</template>

<style lang="less">
html,
body,
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  padding: 0px;
  margin: 0;
  height: 100%;
  width: 100%;
}

div,
label,
li,
ul {
  //   user-select: none;
}
</style>
