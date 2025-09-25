import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import history from 'connect-history-api-fallback'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const app = express()

// 配置路由前缀
const routerPrefix = '/admin'

// 为路由前缀配置history模式
app.use(routerPrefix, history({
  rewrites: [
    {
      from: new RegExp('^' + routerPrefix + '(.*)$'),
      to: function(context) {
        return routerPrefix + '/index.html'
      }
    }
  ]
}))

// 静态资源 - 所有以/admin开头的请求都指向dist目录
app.use(routerPrefix, express.static(path.join(__dirname, 'dist')))

// 重定向根路径到带前缀的路径
app.get('/', (req, res) => {
  res.redirect(routerPrefix)
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
