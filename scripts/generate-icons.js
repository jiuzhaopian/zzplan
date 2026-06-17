// 占位图标生成脚本
// 安装 sharp: npm install sharp --save-dev
// 然后运行: node scripts/generate-icons.js

const fs = require('fs')
const path = require('path')

// 简化的最小有效 PNG (1x1 蓝色像素, base64 编码)
const MINI_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPj/HwADBwIAMCbHYQAAAABJRU5ErkJggg=='
const pngBuffer = Buffer.from(MINI_PNG_BASE64, 'base64')

const resourcesDir = path.join(__dirname, '..', 'resources')

// 创建占位文件
if (!fs.existsSync(resourcesDir)) {
  fs.mkdirSync(resourcesDir, { recursive: true })
}

fs.writeFileSync(path.join(resourcesDir, 'icon.png'), pngBuffer)
fs.writeFileSync(path.join(resourcesDir, 'icon.icns'), pngBuffer) // 非有效 icns，仅占位
fs.writeFileSync(path.join(resourcesDir, 'icon.ico'), pngBuffer) // 非有效 ico，仅占位

console.log('占位图标已生成到 resources/ 目录')
console.log('请替换为实际图标文件（PNG 256x256 以上）')
