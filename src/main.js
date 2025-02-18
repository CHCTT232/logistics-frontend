import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';

// 导入样式
import 'element-plus/dist/index.css';
import './assets/main.css';

// 导入 Element Plus
import ElementPlus from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

// 创建应用
const app = createApp(App);

// 使用插件
app.use(createPinia());
app.use(ElementPlus, {
  locale: zhCn,
  size: 'default',
  zIndex: 3000
});

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

// 使用路由
app.use(router);

// 全局错误处理
app.config.errorHandler = (err, vm, info) => {
  console.error('全局错误:', err);
  console.error('错误组件:', vm);
  console.error('错误信息:', info);
};

// 挂载应用
app.mount('#app'); 