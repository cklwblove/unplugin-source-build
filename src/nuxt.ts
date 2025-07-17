import type { NuxtModule } from '@nuxt/schema'
import { addVitePlugin, addWebpackPlugin, defineNuxtModule } from '@nuxt/kit'
import type { PluginSourceBuildOptions } from './core.js'
import { unpluginSourceBuild } from './core.js'

export interface ModuleOptions extends PluginSourceBuildOptions {

}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'unplugin-source-build',
    configKey: 'sourceBuild',
  },
  defaults: {},
  setup(options, _nuxt) {
    addVitePlugin(() => unpluginSourceBuild.vite(options))
    addWebpackPlugin(() => unpluginSourceBuild.webpack(options))
  },
}) as NuxtModule<ModuleOptions> 