import { addVitePlugin, addWebpackPlugin, defineNuxtModule } from '@nuxt/kit';
import type { NuxtModule } from '@nuxt/schema';
import type { PluginSourceBuildOptions } from './core.js';
import { unpluginSourceBuild } from './core.js';

export interface ModuleOptions extends PluginSourceBuildOptions {}

// 复用 unpluginSourceBuild 实例的 Nuxt 模块
const nuxtModule = defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'unplugin-source-build',
    configKey: 'sourceBuild',
  },
  defaults: {},
  setup(options, _nuxt) {
    // 复用同一个 unpluginSourceBuild 实例的 vite 和 webpack 插件
    addVitePlugin(() => unpluginSourceBuild.vite(options));
    addWebpackPlugin(() => unpluginSourceBuild.webpack(options));
  },
}) as NuxtModule<ModuleOptions>;

export default nuxtModule;
