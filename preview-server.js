/**
 * 灵魂星图 H5 本地预览服务器
 * 简易静态文件服务，支持 hash 路由（未知路径回退到 index.html）
 */
const http = require('http')
const fs = require('fs')
const path = require('path')
const url = require('url')

const PORT = 8080
const ROOT = path.resolve(__dirname, 'dist/build/h5')

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.map': 'application/json',
}

const server = http.createServer((req, res) => {
  let reqPath = decodeURIComponent(url.parse(req.url).pathname)
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html'

  let filePath = path.join(ROOT, reqPath)

  // 防越权：确保仍在 ROOT 内
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403)
    return res.end('Forbidden')
  }

  fs.stat(filePath, (err, stat) => {
    // 若路径不存在或是目录，则回退到 index.html（配合 hash 路由）
    if (err || stat.isDirectory()) {
      filePath = path.join(ROOT, 'index.html')
    }

    const ext = path.extname(filePath).toLowerCase()
    const type = MIME[ext] || 'application/octet-stream'
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-cache' })

    const stream = fs.createReadStream(filePath)
    stream.pipe(res)
    stream.on('error', () => {
      res.writeHead(500)
      res.end('Server error')
    })

    const clientIP = req.socket.remoteAddress || ''
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${reqPath} -> ${path.basename(filePath)}`)
  })
})

server.listen(PORT, '0.0.0.0', () => {
  console.log('=========================================')
  console.log('  灵魂星图 H5 预览服务已启动')
  console.log('=========================================')
  console.log(`  本机访问:  http://localhost:${PORT}`)
  console.log(`  局域网访问: http://<你的IP>:${PORT}`)
  console.log(`  静态目录:  ${ROOT}`)
  console.log('=========================================')
  console.log('  按 Ctrl+C 停止服务')
  console.log('')
})
