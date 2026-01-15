<template>
  <div class="not-found">
    <h1>404</h1>
    <h2>页面不存在</h2>
    <p>抱歉，您访问的页面不存在或已被移除</p>
    <router-link to="/" class="back-home">返回首页</router-link>
  </div>
</template>

<script setup lang="ts">
// 404页面组件
</script>

<style scoped>
.not-found {
  padding: 4rem 2rem;
  text-align: center;
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

h1 {
  font-size: 6rem;
  margin-bottom: 1rem;
  color: #333;
  font-weight: bold;
}

h2 {
  font-size: 2rem;
  margin-bottom: 1.5rem;
  color: #555;
}

p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  color: #777;
  max-width: 400px;
}

.back-home {
  display: inline-block;
  padding: 0.8rem 2rem;
  background-color: #409eff;
  color: white;
  border-radius: 4px;
  text-decoration: none;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.back-home:hover {
  background-color: #66b1ff;
}
</style>