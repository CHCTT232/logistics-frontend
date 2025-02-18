import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import 'element-plus/dist/index.css';
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';
import './assets/main.css';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';

const app = createApp(App);
const pinia = createPinia();

// 使用插件
app.use(pinia);
app.use(router);

// 配置 Element Plus
app.use(ElementPlus, {
  locale: zhCn,
  size: 'default'
});

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

// 全局错误处理
app.config.errorHandler = (err, vm, info) => {
  console.error('全局错误:', err);
  console.error('错误组件:', vm);
  console.error('错误信息:', info);
};

// 挂载应用
app.mount('#app'); 