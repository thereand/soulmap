/**
 * 灵魂星图 - 分享海报 Canvas 绘制工具
 *
 * 在 750×1334 的 Canvas 上绘制深色星空主题分享海报：
 * - 顶部 40%：星空背景 + 发光光球（代表色渐变）
 * - 中部 35%：星灵名称 + 类型代码 + 标签胶囊 + 一句话描述
 * - 底部 25%：分隔线 + CTA 文案 + 小程序码占位
 */

/* ===== 类型定义 ===== */

export interface PosterConfig {
  /** 画布宽度，默认 750 */
  width: number
  /** 画布高度，默认 1334 */
  height: number
  /** 星灵名称（如"星渊策士"） */
  typeName: string
  /** 类型代码（如"INTJ"） */
  typeCode: string
  /** 3 个核心标签 */
  tags: string[]
  /** 一句话描述 */
  description: string
  /** 代表色 HEX */
  color: string
  /** 稀有度（SSR/SR/R） */
  rarity: string
  /** 元素（火/水/风/土/光/暗） */
  element: string
}

/* ===== 辅助函数 ===== */

/** 将 hex 颜色转为 rgba 字符串 */
function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/** 设置圆角矩形路径 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

/* ===== 绘制子模块 ===== */

/**
 * 绘制星空背景
 * 深色渐变 + 随机星点
 */
function drawStarBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): void {
  // 主背景渐变：深紫 → 深蓝黑
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height)
  bgGrad.addColorStop(0, '#0d0118')
  bgGrad.addColorStop(0.35, '#120228')
  bgGrad.addColorStop(0.65, '#0f0a2e')
  bgGrad.addColorStop(1, '#0d0118')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, width, height)

  // 星尘粒子
  const starCount = 120
  for (let i = 0; i < starCount; i++) {
    const sx = Math.random() * width
    const sy = Math.random() * height
    const sr = Math.random() * 1.8 + 0.3
    const opacity = Math.random() * 0.7 + 0.15

    ctx.beginPath()
    ctx.arc(sx, sy, sr, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
    ctx.fill()
  }

  // 大面积亮星（少量）
  for (let i = 0; i < 8; i++) {
    const sx = Math.random() * width
    const sy = Math.random() * height * 0.5
    const sr = Math.random() * 2.5 + 1.5

    ctx.beginPath()
    ctx.arc(sx, sy, sr, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
    ctx.fill()

    // 十字光芒
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.lineWidth = 0.5
    ctx.beginPath()
    ctx.moveTo(sx - sr * 3, sy)
    ctx.lineTo(sx + sr * 3, sy)
    ctx.moveTo(sx, sy - sr * 3)
    ctx.lineTo(sx, sy + sr * 3)
    ctx.stroke()
  }
}

/**
 * 绘制中心发光球体
 * 模拟星灵的能量光球
 */
function drawGlowOrb(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  color: string,
): void {
  // 外层大范围辉光
  const outerGlow = ctx.createRadialGradient(
    centerX, centerY, radius * 0.2,
    centerX, centerY, radius * 2.5,
  )
  outerGlow.addColorStop(0, hexToRgba(color, 0.25))
  outerGlow.addColorStop(0.4, hexToRgba(color, 0.08))
  outerGlow.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = outerGlow
  ctx.fillRect(centerX - radius * 3, centerY - radius * 3, radius * 6, radius * 6)

  // 中层光晕环
  const midGlow = ctx.createRadialGradient(
    centerX, centerY, radius * 0.5,
    centerX, centerY, radius * 1.5,
  )
  midGlow.addColorStop(0, hexToRgba(color, 0.5))
  midGlow.addColorStop(0.6, hexToRgba(color, 0.15))
  midGlow.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = midGlow
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius * 1.5, 0, Math.PI * 2)
  ctx.fill()

  // 核心光球
  const coreGrad = ctx.createRadialGradient(
    centerX - radius * 0.15, centerY - radius * 0.15, radius * 0.05,
    centerX, centerY, radius,
  )
  coreGrad.addColorStop(0, '#ffffff')
  coreGrad.addColorStop(0.2, hexToRgba(color, 0.9))
  coreGrad.addColorStop(0.7, hexToRgba(color, 0.6))
  coreGrad.addColorStop(1, hexToRgba(color, 0.1))
  ctx.fillStyle = coreGrad
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
  ctx.fill()

  // 环绕小星点
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI * 2 * i) / 6 + Math.PI / 6
    const orbitR = radius * 1.6
    const px = centerX + Math.cos(angle) * orbitR
    const py = centerY + Math.sin(angle) * orbitR
    const dotR = 2 + Math.random() * 2

    ctx.beginPath()
    ctx.arc(px, py, dotR, 0, Math.PI * 2)
    ctx.fillStyle = hexToRgba(color, 0.7)
    ctx.fill()
  }
}

/**
 * 绘制文字（支持自动换行）
 * @returns 绘制完成后的 y 坐标（最后一行底部）
 */
function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  fontSize: number,
  color: string,
  align: CanvasTextAlign = 'center',
  lineHeightMultiplier: number = 1.5,
): number {
  ctx.fillStyle = color
  ctx.font = `${fontSize}px sans-serif`
  ctx.textAlign = align
  ctx.textBaseline = 'middle'

  const lineHeight = fontSize * lineHeightMultiplier
  const chars = text.split('')
  let line = ''
  let currentY = y

  for (let i = 0; i < chars.length; i++) {
    const testLine = line + chars[i]
    const metrics = ctx.measureText(testLine)
    if (metrics.width > maxWidth && line.length > 0) {
      ctx.fillText(line, x, currentY)
      line = chars[i]
      currentY += lineHeight
    } else {
      line = testLine
    }
  }
  if (line) {
    ctx.fillText(line, x, currentY)
    currentY += lineHeight
  }

  return currentY
}

/**
 * 绘制单个标签胶囊
 * @returns 胶囊总宽度
 */
function drawTag(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
): number {
  const fontSize = 22
  const paddingH = 24
  const paddingV = 10
  const height = fontSize + paddingV * 2

  ctx.font = `${fontSize}px sans-serif`
  const textWidth = ctx.measureText(text).width
  const totalWidth = textWidth + paddingH * 2
  const radius = height / 2

  // 胶囊背景
  roundRect(ctx, x, y - height / 2, totalWidth, height, radius)
  ctx.fillStyle = hexToRgba(color, 0.18)
  ctx.fill()
  ctx.strokeStyle = hexToRgba(color, 0.5)
  ctx.lineWidth = 1.5
  ctx.stroke()

  // 胶囊文字
  ctx.fillStyle = color
  ctx.font = `${fontSize}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, x + totalWidth / 2, y)

  return totalWidth
}

/**
 * 绘制底部 CTA 区域
 * 浅色背景 + 文案 + 小程序码占位
 */
function drawFooter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  accentColor: string,
): void {
  const footerTop = height * 0.75

  // 分隔渐变线
  const lineGrad = ctx.createLinearGradient(width * 0.15, 0, width * 0.85, 0)
  lineGrad.addColorStop(0, 'rgba(255,255,255,0)')
  lineGrad.addColorStop(0.5, hexToRgba(accentColor, 0.5))
  lineGrad.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = lineGrad
  ctx.fillRect(width * 0.1, footerTop, width * 0.8, 1.5)

  // 底部区域微亮背景
  const footerBg = ctx.createLinearGradient(0, footerTop, 0, height)
  footerBg.addColorStop(0, 'rgba(13, 1, 24, 0)')
  footerBg.addColorStop(0.2, 'rgba(20, 10, 40, 0.6)')
  footerBg.addColorStop(1, 'rgba(13, 1, 24, 0.95)')
  ctx.fillStyle = footerBg
  ctx.fillRect(0, footerTop + 10, width, height - footerTop - 10)

  const centerY = footerTop + (height - footerTop) * 0.38

  // 主文案
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 32px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('✦  来探索你的灵魂星图  ✦', width / 2, centerY)

  // 副文案
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.font = '20px sans-serif'
  ctx.fillText('看看你和 TA 是什么灵魂关系', width / 2, centerY + 42)

  // 小程序码占位（白色圆角方形）
  const qrSize = 100
  const qrX = width / 2 - qrSize / 2
  const qrY = centerY + 72
  roundRect(ctx, qrX, qrY, qrSize, qrSize, 12)
  ctx.fillStyle = '#ffffff'
  ctx.fill()

  // 小程序码内部灰色占位
  const innerSize = 80
  const innerX = qrX + (qrSize - innerSize) / 2
  const innerY = qrY + (qrSize - innerSize) / 2
  roundRect(ctx, innerX, innerY, innerSize, innerSize, 6)
  ctx.fillStyle = '#e5e5e5'
  ctx.fill()

  // 小程序码内「扫码」文字
  ctx.fillStyle = '#999999'
  ctx.font = '16px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('小程序码', qrX + qrSize / 2, qrY + qrSize / 2)

  // "长按识别"文案
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.font = '18px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('长按识别  探索你的星灵', width / 2, qrY + qrSize + 28)
}

/* ===== 主绘制函数 ===== */

/**
 * 绘制完整海报到 Canvas
 *
 * @param ctx  - Canvas 2D 上下文
 * @param config - 海报配置数据
 */
export function drawPoster(
  ctx: CanvasRenderingContext2D,
  config: PosterConfig,
): void {
  const { width = 750, height = 1334, typeName, typeCode, tags, description, color, rarity, element } = config

  // 1. 清空画布
  ctx.clearRect(0, 0, width, height)

  // 2. 绘制星空背景
  drawStarBackground(ctx, width, height)

  // 3. 绘制顶部光球（顶部 40% 区域的中心）
  const orbCenterX = width / 2
  const orbCenterY = height * 0.22
  const orbRadius = 80
  drawGlowOrb(ctx, orbCenterX, orbCenterY, orbRadius, color)

  // 元素文字（光球内）
  const elementIcons: Record<string, string> = {
    '火': '🔥', '水': '💧', '风': '🌪', '土': '🌍', '光': '✨', '暗': '🌑',
  }
  ctx.font = '48px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(elementIcons[element] || '⭐', orbCenterX, orbCenterY)

  // 稀有度标签（光球右上角）
  const rarityColors: Record<string, string> = {
    SSR: '#ffd700', SR: '#a855f7', R: '#3b82f6',
  }
  const rarityColor = rarityColors[rarity] || '#3b82f6'
  const rarityX = orbCenterX + orbRadius * 1.2
  const rarityY = orbCenterY - orbRadius * 0.9

  ctx.font = 'bold 20px sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  const rarityTextW = ctx.measureText(rarity).width
  roundRect(ctx, rarityX - 4, rarityY - 14, rarityTextW + 16, 28, 6)
  ctx.fillStyle = hexToRgba(rarityColor, 0.2)
  ctx.fill()
  ctx.strokeStyle = hexToRgba(rarityColor, 0.6)
  ctx.lineWidth = 1
  ctx.stroke()
  ctx.fillStyle = rarityColor
  ctx.fillText(rarity, rarityX + 4, rarityY)

  // ===== 中部区域（40%~75%）=====
  const midStartY = height * 0.42

  // 4. 星灵名称
  ctx.font = 'bold 56px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#ffffff'
  ctx.shadowColor = hexToRgba(color, 0.6)
  ctx.shadowBlur = 20
  ctx.fillText(typeName, width / 2, midStartY + 30)
  ctx.shadowBlur = 0

  // 5. 类型代码
  ctx.font = '300 36px sans-serif'
  ctx.fillStyle = hexToRgba(color, 0.7)
  ctx.textAlign = 'center'
  ctx.fillText(typeCode.split('').join(' '), width / 2, midStartY + 82)

  // 6. 分隔装饰线
  const decoY = midStartY + 115
  const decoGrad = ctx.createLinearGradient(width * 0.25, 0, width * 0.75, 0)
  decoGrad.addColorStop(0, 'rgba(255,255,255,0)')
  decoGrad.addColorStop(0.5, hexToRgba(color, 0.4))
  decoGrad.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = decoGrad
  ctx.fillRect(width * 0.2, decoY, width * 0.6, 1)

  // 7. 三个标签胶囊
  const tagY = decoY + 42
  const tagGap = 14
  // 先测量总宽度
  ctx.font = '22px sans-serif'
  const tagWidths = tags.map((t) => ctx.measureText(t).width + 48)
  const totalTagWidth = tagWidths.reduce((a, b) => a + b, 0) + tagGap * (tags.length - 1)
  let tagX = (width - totalTagWidth) / 2

  for (let i = 0; i < tags.length; i++) {
    const w = drawTag(ctx, tags[i], tagX, tagY, color)
    tagX += w + tagGap
  }

  // 8. 一句话描述
  const descY = tagY + 50
  ctx.font = '24px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.65)'
  drawWrappedText(ctx, description, width / 2, descY, width * 0.75, 24, 'rgba(255, 255, 255, 0.65)', 'center', 1.6)

  // 9. 底部 CTA 区域
  drawFooter(ctx, width, height, color)

  // 10. 顶部品牌标识
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'
  ctx.fillText('SOULMAP · 灵魂星图', width / 2, 40)
}
