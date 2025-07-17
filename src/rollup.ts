import { unpluginSourceBuild } from './core.js';

// 复用 unpluginSourceBuild 实例的 rollup 插件，只使用默认导出
export default unpluginSourceBuild.rollup;
