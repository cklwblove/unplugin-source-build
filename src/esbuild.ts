import { unpluginSourceBuild } from './core.js';

// 复用 unpluginSourceBuild 实例的 esbuild 插件
const esbuildPlugin = unpluginSourceBuild.esbuild;

export default esbuildPlugin;
export { esbuildPlugin as esbuild };
