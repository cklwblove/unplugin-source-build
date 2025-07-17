# unplugin-source-build

[![npm version](https://img.shields.io/npm/v/unplugin-source-build.svg)](https://www.npmjs.com/package/unplugin-source-build)

一个通用的构建插件，用于为monorepo项目提供源码引用支持。支持Vite、Webpack、Rollup、esbuild、Rspack等多种构建工具。

## 特性

- 🚀 支持多种构建工具：Vite、Webpack、Rollup、esbuild、Rspack、Nuxt
- 📦 自动检测monorepo项目（支持pnpm、Rush等）
- 🔧 可配置源码字段和解析优先级
- 📁 自动处理依赖项目的源码路径
- 🔄 支持递归依赖解析
- ⚡ TypeScript支持

## 安装

```bash
npm i -D unplugin-source-build
# 或
pnpm add -D unplugin-source-build
# 或
yarn add -D unplugin-source-build
```

## 使用方式

### Vite

```ts
// vite.config.ts
import SourceBuild from 'unplugin-source-build/vite'

export default defineConfig({
  plugins: [
    SourceBuild({
      // 配置选项
    }),
  ],
})
```

### Webpack

```js
// webpack.config.js
module.exports = {
  /* ... */
  plugins: [
    require('unplugin-source-build/webpack')({
      // 配置选项
    }),
  ],
}
```

### Rollup

```js
// rollup.config.js
import SourceBuild from 'unplugin-source-build/rollup'

export default {
  plugins: [
    SourceBuild({
      // 配置选项
    }),
  ],
}
```

### esbuild

```js
// esbuild.config.js
import { build } from 'esbuild'
import SourceBuild from 'unplugin-source-build/esbuild'

build({
  plugins: [SourceBuild()],
})
```

### Rspack

```js
// rspack.config.js
module.exports = {
  /* ... */
  plugins: [
    require('unplugin-source-build/rspack')({
      // 配置选项
    }),
  ],
}
```

### Nuxt

```js
// nuxt.config.js
export default defineNuxtConfig({
  modules: [
    ['unplugin-source-build/nuxt', {
      // 配置选项
    }],
  ],
})
```

## 配置选项

```ts
interface PluginSourceBuildOptions {
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
```

## 工作原理

这个插件会：

1. **检测monorepo环境**：自动识别pnpm workspace、Rush等monorepo配置
2. **分析项目依赖**：递归分析当前项目依赖的其他monorepo子项目
3. **配置构建工具**：根据不同的构建工具，配置相应的解析规则
4. **处理源码引用**：让构建工具优先使用依赖项目的源码而不是编译后的代码

### 支持的package.json字段

```json
{
  "source": "./src/index.ts",
  "exports": {
    ".": {
      "source": "./src/index.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  }
}
```

## 示例

假设你有一个monorepo项目结构：

```
my-monorepo/
├── packages/
│   ├── app/          # 主应用
│   ├── ui-lib/       # UI组件库
│   └── utils/        # 工具函数库
└── package.json
```

在`app`项目中使用`ui-lib`和`utils`时，插件会自动让构建工具使用这些依赖的源码版本，实现：

- 更快的开发体验（无需等待依赖编译）
- 更好的调试体验（源码映射）
- 热更新支持

## 从rsbuild插件迁移

如果你之前使用的是`@rsbuild/plugin-source-build`，可以这样迁移：

```diff
- import { pluginSourceBuild } from '@rsbuild/plugin-source-build'
+ import SourceBuild from 'unplugin-source-build/vite'

export default defineConfig({
  plugins: [
-   pluginSourceBuild({
+   SourceBuild({
      sourceField: 'source',
      resolvePriority: 'source',
    }),
  ],
})
```

## 许可证

MIT License
