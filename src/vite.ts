import { unpluginSourceBuild } from './core.js';

// 复用 unpluginSourceBuild 实例的 vite 插件
const vitePlugin = unpluginSourceBuild.vite;

export default vitePlugin;
export { vitePlugin as vite };
