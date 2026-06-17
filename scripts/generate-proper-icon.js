// 生成 256x256 蓝色主题 PNG 图标（纯 Node.js，无需依赖）
const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

function createPNG(width, height) {
  // PNG 签名
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  // IHDR chunk: 宽高 + 8bit RGBA
  const ihdrData = Buffer.alloc(13)
  ihdrData.writeUInt32BE(width, 0)   // width
  ihdrData.writeUInt32BE(height, 4)  // height
  ihdrData[8] = 8   // bit depth
  ihdrData[9] = 6   // color type: RGBA
  ihdrData[10] = 0  // compression
  ihdrData[11] = 0  // filter
  ihdrData[12] = 0  // interlace
  const ihdrChunk = createChunk('IHDR', ihdrData)

  // IDAT: 像素数据 (每行前加 filter=0 字节)
  const rawData = Buffer.alloc(height * (1 + width * 4))
  for (let y = 0; y < height; y++) {
    const rowOffset = y * (1 + width * 4)
    rawData[rowOffset] = 0 // filter: none
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4
      // 渐变蓝色: 从深蓝到浅蓝
      const ratio = y / height
      rawData[pixelOffset]     = Math.round(37 + ratio * (59 - 37))   // R
      rawData[pixelOffset + 1] = Math.round(99 + ratio * (130 - 99))  // G
      rawData[pixelOffset + 2] = Math.round(235 + ratio * (246 - 235)) // B
      rawData[pixelOffset + 3] = 255 // A
    }
  }
  const compressed = zlib.deflateSync(rawData)
  const idatChunk = createChunk('IDAT', compressed)

  // IEND
  const iendChunk = createChunk('IEND', Buffer.alloc(0))

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk])
}

function createChunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length, 0)
  const typeBuffer = Buffer.from(type, 'ascii')
  const crc = crc32(Buffer.concat([typeBuffer, data]))
  const crcBuffer = Buffer.alloc(4)
  crcBuffer.writeUInt32BE(crc, 0)
  return Buffer.concat([length, typeBuffer, data, crcBuffer])
}

function crc32(buf) {
  let crc = 0xFFFFFFFF
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i]
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0)
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0
}

const resourcesDir = path.join(__dirname, '..', 'resources')
const png = createPNG(256, 256)

fs.writeFileSync(path.join(resourcesDir, 'icon.png'), png)
fs.writeFileSync(path.join(resourcesDir, 'icon.ico'), png) // Windows 接受 PNG 格式的 ico
console.log('256x256 图标已生成: resources/icon.png, resources/icon.ico')
