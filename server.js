import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import history from 'connect-history-api-fallback'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const app = express()

// 启用history模式
app.use(history())

// 静态资源
app.use(express.static(path.join(__dirname, 'dist')))

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
