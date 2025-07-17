import fs from 'node:fs'
import path from 'node:path'
import type { UnpluginFactory } from 'unplugin'
import { createUnplugin } from 'unplugin'
import json5 from 'json5'
import {
  filterByField,
  getDependentProjects,
} from './project-utils/index.js'
import type { Project } from './project.js'
import type { TsConfig, ExtraMonorepoStrategies } from './types/index.js'

export interface PluginSourceBuildOptions {
  /**
   * 用于配置源码文件的解析字段
   * @default 'source'
   */
  sourceField?: string
  /**
   * 是否优先读取源码还是输出代码
   * @default 'source'
   */
  resolvePriority?: 'source' | 'output'
  /**
   * 项目名称，如果未提供则使用当前工作目录
   */
  projectName?: string
  /**
   * 额外的monorepo策略
   */
  extraMonorepoStrategies?: ExtraMonorepoStrategies
}

export const getSourceInclude = async (options: {
  projects: Project[]
  sourceField: string
}): Promise<string[]> => {
  const { projects, sourceField } = options

  const includes = []
  for (const project of projects) {
    includes.push(
      ...project.getSourceEntryPaths({ field: sourceField, exports: true }),
    )
  }

  return includes
}

const getReferences = async (
  tsconfigPath: string,
  projects: Project[],
  userReferences?: string[] | 'auto',
): Promise<string[]> => {
  const references = new Set<string>()

  for (const project of projects || []) {
    const filePath = path.join(project.dir, 'tsconfig.json')
    if (fs.existsSync(filePath)) {
      references.add(filePath)
    }
  }

  // Add references in the current project's tsconfig.json
  if (fs.existsSync(tsconfigPath)) {
    const tsconfig = json5.parse<TsConfig>(
      fs.readFileSync(tsconfigPath, 'utf-8'),
    )

    const configReferences = [
      ...(Array.isArray(userReferences) ? userReferences : []),
      ...(tsconfig.references
        ? tsconfig.references.map((item) => item.path).filter(Boolean)
        : []),
    ]

    if (configReferences.length) {
      const baseDir = path.dirname(tsconfigPath)
      for (const item of configReferences) {
        if (!item) continue

        const absolutePath = path.isAbsolute(item)
          ? item
          : path.join(baseDir, item)

        references.add(absolutePath)
      }
    }
  }

  // avoid self reference, it will break the resolver
  references.delete(tsconfigPath)

  return Array.from(references)
}

const unpluginFactory: UnpluginFactory<PluginSourceBuildOptions | undefined> = (
  options = {},
) => {
  const {
    projectName,
    sourceField = 'source',
    resolvePriority = 'source',
    extraMonorepoStrategies,
  } = options

  let projects: Project[] | undefined
  let projectRootPath: string

  return {
    name: 'unplugin-source-build',
    
    buildStart: async function () {
      projectRootPath = process.cwd()

      projects =
        projects ||
        (await getDependentProjects(projectName || projectRootPath, {
          cwd: projectRootPath,
          recursive: true,
          filter: filterByField(sourceField, true),
          extraMonorepoStrategies,
        }))
    },

    // Vite 特定配置
    vite: {
      config: async (config) => {
        if (!projects?.length) return

        const includes = await getSourceInclude({
          projects,
          sourceField,
        })

        // 配置解析优先级
        config.resolve = config.resolve ?? {}
        config.resolve.mainFields = config.resolve.mainFields ?? []
        
        if (resolvePriority === 'source') {
          config.resolve.mainFields.unshift(sourceField)
        } else {
          config.resolve.mainFields.push(sourceField)
        }

        config.resolve.conditions = config.resolve.conditions ?? []
        config.resolve.conditions.push(sourceField)

        // 配置优化依赖，排除源码包
        config.optimizeDeps = config.optimizeDeps ?? {}
        config.optimizeDeps.exclude = config.optimizeDeps.exclude ?? []
        
        // 排除monorepo子项目，让它们使用源码
        for (const project of projects) {
          if (!config.optimizeDeps.exclude.includes(project.name)) {
            config.optimizeDeps.exclude.push(project.name)
          }
        }
      },
      configResolved: async (config) => {
        // 在Vite中处理TypeScript配置
        const tsconfigPath = path.join(config.root, 'tsconfig.json')
        if (fs.existsSync(tsconfigPath) && projects?.length) {
          const references = await getReferences(tsconfigPath, projects)
          // 这里可以通过Vite的插件系统进一步处理TypeScript references
        }
      },
    },

    // Webpack 特定配置
    webpack: (compiler) => {
      compiler.hooks.afterEnvironment.tap('unplugin-source-build', () => {
        const { resolve } = compiler.options

        if (!resolve) return

        // 配置 mainFields
        resolve.mainFields = resolve.mainFields ?? ['browser', 'module', 'main']
        if (resolvePriority === 'source') {
          resolve.mainFields.unshift(sourceField)
        } else {
          resolve.mainFields.push(sourceField)
        }

        // 配置 conditionNames
        resolve.conditionNames = resolve.conditionNames ?? ['import', 'require', 'node']
        resolve.conditionNames.push(sourceField)
      })

      // 处理TypeScript配置
      compiler.hooks.beforeCompile.tapAsync('unplugin-source-build', async (params, callback) => {
        if (projects?.length) {
          const tsconfigPath = path.join(compiler.context, 'tsconfig.json')
          if (fs.existsSync(tsconfigPath)) {
            const references = await getReferences(tsconfigPath, projects)
            
            // 查找ts-loader或fork-ts-checker-webpack-plugin并配置references
            const { plugins } = compiler.options
            if (plugins) {
              for (const plugin of plugins) {
                if (plugin.constructor.name === 'ForkTsCheckerWebpackPlugin') {
                  // 配置fork-ts-checker-webpack-plugin的references
                  if (plugin.options && typeof plugin.options === 'object') {
                    plugin.options.typescript = plugin.options.typescript ?? {}
                    if (typeof plugin.options.typescript === 'object') {
                      plugin.options.typescript.build = true
                      plugin.options.typescript.references = references
                    }
                  }
                }
              }
            }
          }
        }
        callback()
      })
    },

    // Rollup 特定配置
    rollup: {
      buildStart: async function () {
        if (!projects?.length) return

        const includes = await getSourceInclude({
          projects,
          sourceField,
        })

        // 在 Rollup 中，我们主要通过 resolveId 钩子来处理源码解析
        // 这个逻辑会在下面的 resolveId 钩子中实现
      },
      
      resolveId: async function (id, importer) {
        if (!projects?.length) return null

        // 检查是否是monorepo内部的包
        const project = projects.find(p => p.name === id || id.startsWith(p.name + '/'))
        if (project) {
          // 尝试解析到源码版本
          try {
            const sourceEntries = project.getSourceEntryPaths({ field: sourceField, exports: true })
            if (sourceEntries.length > 0) {
              return sourceEntries[0]
            }
          } catch (error) {
            // 如果获取源码路径失败，使用默认解析
          }
        }

        return null
      },
    },

    // esbuild 特定配置
    esbuild: {
      setup: (build) => {
        build.onResolve({ filter: /.*/ }, async (args) => {
          if (!projects?.length) return

          // 检查是否是monorepo内部的包
          const project = projects.find(p => p.name === args.path || args.path.startsWith(p.name + '/'))
          if (project) {
            try {
              const sourceEntries = project.getSourceEntryPaths({ field: sourceField, exports: true })
              if (sourceEntries.length > 0) {
                return { path: sourceEntries[0] }
              }
            } catch (error) {
              // 如果获取源码路径失败，使用默认解析
            }
          }
        })
      },
    },

    // Rspack 特定配置（类似Webpack）
    rspack: (compiler) => {
      compiler.hooks.afterEnvironment.tap('unplugin-source-build', () => {
        const { resolve } = compiler.options

        if (!resolve) return

        // 配置 mainFields
        resolve.mainFields = resolve.mainFields ?? ['browser', 'module', 'main']
        if (resolvePriority === 'source') {
          resolve.mainFields.unshift(sourceField)
        } else {
          resolve.mainFields.push(sourceField)
        }

        // 配置 conditionNames  
        resolve.conditionNames = resolve.conditionNames ?? ['import', 'require', 'node']
        resolve.conditionNames.push(sourceField)

        // Rspack 支持 tsConfig，配置references
        if (projects?.length) {
          const tsconfigPath = path.join(compiler.context, 'tsconfig.json')
          if (fs.existsSync(tsconfigPath)) {
            getReferences(tsconfigPath, projects).then(references => {
              resolve.tsConfig = {
                configFile: tsconfigPath,
                references: references,
              }
            })
          }
        }
      })
    },
  }
}

export const unpluginSourceBuild = /* #__PURE__ */ createUnplugin(unpluginFactory)

export default unpluginSourceBuild 