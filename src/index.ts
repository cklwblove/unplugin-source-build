export { unpluginSourceBuild as default, type PluginSourceBuildOptions } from './core.js'
export { Project } from './project.js'
export { getMonorepoBaseData, getMonorepoSubProjects } from './common/index.js'
export type { MonorepoAnalyzer, ExtraMonorepoStrategies } from './types/index.js'
export type { Filter } from './project-utils/filter.js'

// 为了向后兼容，也导出一个带前缀的版本
export { unpluginSourceBuild } from './core.js'
