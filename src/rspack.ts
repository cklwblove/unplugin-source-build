import { unpluginSourceBuild } from './core.js';

// 复用 unpluginSourceBuild 实例的 rspack 插件
const rspackPlugin = unpluginSourceBuild.rspack;

export default rspackPlugin;
export { rspackPlugin as rspack };
