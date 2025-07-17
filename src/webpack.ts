import { unpluginSourceBuild } from './core.js';

// 复用 unpluginSourceBuild 实例的 webpack 插件
const webpackPlugin = unpluginSourceBuild.webpack;

export default webpackPlugin;
export { webpackPlugin as webpack };
