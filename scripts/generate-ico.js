// 生成合法的 256x256 .ico 文件（ICO 容器 + PNG 图像数据）
const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

function createPNGData(width, height) {
  // IHDR
  const ihdrData = Buffer.alloc(13)
  ihdrData.writeUInt32BE(width, 0)
  ihdrData.writeUInt32BE(height, 4)
  ihdrData[8] = 8   // bit depth
  ihdrData[9] = 6   // color type: RGBA
  ihdrData[10] = 0  // compression
  ihdrData[11] = 0  // filter
  ihdrData[12] = 0  // interlace
  const ihdr = makeChunk('IHDR', ihdrData)

  // IDAT: 像素
  const raw = Buffer.alloc(height * (1 + width * 4))
  for (let y = 0; y < height; y++) {
    const rowOff = y * (1 + width * 4)
    raw[rowOff] = 0 // filter: none
    for (let x = 0; x < width; x++) {
      const off = rowOff + 1 + x * 4
      const r = Math.round(y / height * 255)
      raw[off] = Math.round(37 + (59 - 37) * (y / height))     // R
      raw[off + 1] = Math.round(99 + (130 - 99) * (y / height))  // G
      raw[off + 2] = Math.round(200 + (246 - 200) * (y / height)) // B
      raw[off + 3] = 255 // A
    }
  }
  const compressed = zlib.deflateSync(raw)
  const idat = makeChunk('IDAT', compressed)
  const iend = makeChunk('IEND', Buffer.alloc(0))

  return Buffer.concat([ihdr, idat, iend])
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const typeB = Buffer.from(type, 'ascii')
  const crcVal = crc32(Buffer.concat([typeB, data]))
  const crcB = Buffer.alloc(4)
  crcB.writeUInt32BE(crcVal, 0)
  return Buffer.concat([len, typeB, data, crcB])
}

function crc32(buf) {
  let crc = 0xffffffff
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i]
    for (let j = 0; j < 8; j++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
  }
  return (crc ^ 0xffffffff) >>> 0
}

function buildICO(pngData) {
  const width = 256
  const height = 256
  const imageOffset = 6 + 16 // header(6) + 1 directory entry(16)

  // ICO header
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)    // reserved
  header.writeUInt16LE(1, 2)    // type: icon
  header.writeUInt16LE(1, 4)    // count: 1 image

  // ICONDIRENTRY
  const entry = Buffer.alloc(16)
  entry.writeUInt8(width >= 256 ? 0 : width, 0)   // width (0 means 256)
  entry.writeUInt8(height >= 256 ? 0 : height, 1)  // height (0 means 256)
  entry.writeUInt8(0, 2)   // palette
  entry.writeUInt8(0, 3)   // reserved
  entry.writeUInt16LE(1, 4) // color planes
  entry.writeUInt32LE(32, 6) // bits per pixel
  entry.writeUInt32LE(pngData.length, 8) // image size
  entry.writeUInt32LE(imageOffset, 12)   // image offset

  return Buffer.concat([header, entry, pngData])
}

const pngData = createPNGData(256, 256)
const pngFile = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), // PNG signature
  pngData
])

const icoData = buildICO(pngFile)

const resourcesDir = path.join(__dirname, '..', 'resources')
fs.writeFileSync(path.join(resourcesDir, 'icon.png'), pngFile)
fs.writeFileSync(path.join(resourcesDir, 'icon.ico'), icoData)
console.log('✅ 合法 ICO 图标已生成: resources/icon.ico (256x256)')
console.log('✅ PNG 图标已生成: resources/icon.png (256x256)')
