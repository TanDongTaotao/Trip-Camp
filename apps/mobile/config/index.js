// Taro 项目配置入口：
// - mini：小程序相关构建配置
// - h5：H5 构建与 devServer 配置
const fs = require('fs')
const path = require('path')

const loadLocalEnv = () => {
  const env = process.env.NODE_ENV || 'development'
  const candidates = [
    path.join(__dirname, `../.env.${env}.local`),
    path.join(__dirname, '../.env.local')
  ]
  const applyEnv = (content) => {
    content.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) return
      const idx = trimmed.indexOf('=')
      if (idx === -1) return
      const key = trimmed.slice(0, idx).trim()
      let value = trimmed.slice(idx + 1).trim()
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      if (process.env[key] === undefined) {
        process.env[key] = value
      }
    })
  }
  candidates.forEach((filePath) => {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8')
      applyEnv(content)
    }
  })
}

loadLocalEnv()

const config = {
  projectName: 'trip-camp-mobile',
  date: '2024-02-08',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: ['@tarojs/plugin-framework-react', '@tarojs/plugin-html'],
  defineConstants: {
    BAIDU_AK: JSON.stringify(process.env.TARO_APP_BAIDU_AK || '')
  },
  copy: {
    patterns: [
    ],
    options: {
    }
  },
  framework: 'react',
  compiler: 'webpack5',
  mini: {
    postcss: {
      pxtransform: {
        enable: true,
        config: {

        }
      },
      url: {
        enable: true,
        config: {
          limit: 1024
        }
      },
      cssModules: {
        enable: false,
        config: {
          namingPattern: 'module',
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    }
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    postcss: {
      autoprefixer: {
        enable: true,
        config: {
        }
      },
      cssModules: {
        enable: false,
        config: {
          namingPattern: 'module',
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    },
    devServer: {
      // H5 开发代理（可选）：
      // - 访问 /api/v1/* 时转发到本机后端 http://localhost:3000
      // - 主要用于规避浏览器跨域问题
      proxy: {
        '/api/v1': {
          target: 'http://localhost:3000',
          changeOrigin: true
        }
      }
    }
  }
}

module.exports = function (merge) {
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev'))
  }
  return merge({}, config, require('./prod'))
}
