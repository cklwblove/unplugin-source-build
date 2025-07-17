import { unpluginSourceBuild } from './core.js';

// 复用 unpluginSourceBuild 实例的 rollup 插件
const rollupPlugin = unpluginSourceBuild.rollup;

export default rollupPlugin;
export { rollupPlugin as rollup };
