import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import 'element-plus/dist/index.css';
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';
import './assets/main.css';
import App from './App.vue';
import router from './router';

const app = createApp(App);

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

// 使用插件
app.use(createPinia());
app.use(router);
app.use(ElementPlus, {
  locale: zhCn,
  // 配置全局主题
  zIndex: 3000,
  size: 'default',
  button: {
    autoInsertSpace: true
  },
  message: {
    max: 3
  },
  // 自定义主题色
  theme: {
    colors: {
      primary: '#4CAF50',
      success: '#66BB6A',
      warning: '#FFB74D',
      danger: '#EF5350',
      info: '#90A4AE'
    }
  }
});

// 全局错误处理
app.config.errorHandler = (err, vm, info) => {
  console.error('全局错误:', err);
  console.error('错误组件:', vm);
  console.error('错误信息:', info);
};

// 挂载应用
app.mount('#app'); 