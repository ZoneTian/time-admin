# 部署指南

## 生产环境配置

### 解决刷新页面404问题

由于应用使用了Vue Router的history模式，在生产环境部署时需要配置服务器以处理SPA路由。

### 项目自带的服务器配置

本项目包含一个内置的Node.js服务器(server.js)，配置特点包括：

1. **正确处理SPA路由**：当访问不存在的路径时，会返回index.html文件，确保Vue Router的history模式正常工作

2. **环境感知的API请求处理**：
   - **生产环境**：使用307重定向让客户端直接请求后端API (https://www.womenshike.top)，避免代理环节
   - **开发环境**：使用代理将/admin-api请求转发到www.womenshike.top:443，并包含路径修正逻辑

3. **静态文件服务**：正确处理各种静态资源请求

环境判断基于NODE_ENV环境变量，生产环境下应确保该变量设置为'production'

### 其他Web服务器配置

如果你使用其他Web服务器（如Nginx、Apache等），请参考以下配置方法：

#### Nginx配置

```nginx
server {
  listen 80;
  server_name your-domain.com;

  root /path/to/your/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

#### Apache配置

在你的Apache配置文件中添加：

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

#### 开发环境

开发环境下的404问题已通过在vite.config.ts中添加以下配置解决：

```typescript
server: {
  // ... 其他配置
  historyApiFallback: true
}
```

## 部署步骤

1. 构建生产环境代码：
   ```bash
   npm run build
   ```

2. 将dist目录下的文件部署到你的服务器

3. 配置服务器以处理SPA路由（见上方配置）

4. 重启服务器

## 注意事项

- 确保你的服务器已安装并启用了相应的重写模块（如Nginx的rewrite模块或Apache的mod_rewrite）
- 如果你使用其他服务器，请参考其文档以了解如何配置SPA路由 fallback