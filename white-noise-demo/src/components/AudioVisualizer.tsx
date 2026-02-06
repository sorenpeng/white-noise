import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import styles from '../styles/AudioVisualizer.module.css'
import type { AudioVisualizationData } from '../types/audio'

interface AudioVisualizerProps {
  analyzerData: AudioVisualizationData | null
  isPlaying: boolean
  energy: number
  brightness: number
  speed: number
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  analyzerData,
  isPlaying,
  energy,
  brightness,
  speed,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const [visualMode, setVisualMode] = useState<'spectrum' | 'waveform'>('spectrum')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const draw = () => {
      const rect = canvas.getBoundingClientRect()
      const width = rect.width
      const height = rect.height

      // 清除画布
      ctx.clearRect(0, 0, width, height)

      if (!isPlaying || !analyzerData) {
        // 绘制静态状态
        drawStaticState(ctx, width, height)
      } else {
        // 根据模式绘制可视化
        if (visualMode === 'spectrum') {
          drawSpectrum(ctx, width, height, analyzerData.frequencyData)
        } else {
          drawWaveform(ctx, width, height, analyzerData.waveformData)
        }
      }

      // 绘制参数指示器
      drawParameterIndicators(ctx, width, height)

      animationRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [analyzerData, isPlaying, visualMode, energy, brightness, speed])

  const drawStaticState = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // 绘制静态网格
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.1)'
    ctx.lineWidth = 1

    // 垂直线
    for (let i = 0; i <= 10; i++) {
      const x = (width / 10) * i
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }

    // 水平线
    for (let i = 0; i <= 5; i++) {
      const y = (height / 5) * i
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // 中心文字
    ctx.fillStyle = 'rgba(148, 163, 184, 0.6)'
    ctx.font = '16px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('点击播放开始音频可视化', width / 2, height / 2)
  }

  const drawSpectrum = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    frequencyData: Uint8Array
  ) => {
    const barCount = Math.min(frequencyData.length, 64)
    const barWidth = width / barCount

    for (let i = 0; i < barCount; i++) {
      const barHeight = (frequencyData[i] / 255) * height * 0.8
      const x = i * barWidth
      const y = height - barHeight

      // 根据参数调整颜色
      const hue = 220 + brightness * 60 // 从深蓝到青色
      const saturation = 60 + energy * 40 // 饱和度随能量变化
      const lightness = 40 + brightness * 30 // 亮度随明暗变化

      // 创建渐变
      const gradient = ctx.createLinearGradient(x, y, x, height)
      gradient.addColorStop(0, `hsla(${hue}, ${saturation}%, ${lightness + 20}%, 0.8)`)
      gradient.addColorStop(1, `hsla(${hue}, ${saturation}%, ${lightness}%, 0.4)`)

      ctx.fillStyle = gradient
      ctx.fillRect(x, y, barWidth - 1, barHeight)

      // 添加高光效果
      if (barHeight > height * 0.6) {
        ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness + 40}%, 0.6)`
        ctx.fillRect(x, y, barWidth - 1, Math.min(barHeight * 0.3, 20))
      }
    }
  }

  const drawWaveform = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    waveformData: Uint8Array
  ) => {
    const centerY = height / 2
    const amplitude = height * 0.4

    ctx.beginPath()
    ctx.strokeStyle = `hsla(${220 + brightness * 60}, ${60 + energy * 40}%, ${50 + brightness * 20}%, 0.8)`
    ctx.lineWidth = 2

    for (let i = 0; i < waveformData.length; i++) {
      const x = (i / waveformData.length) * width
      const y = centerY + ((waveformData[i] - 128) / 128) * amplitude

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }

    ctx.stroke()

    // 添加填充效果
    ctx.globalAlpha = 0.3
    ctx.fillStyle = `hsla(${220 + brightness * 60}, ${60 + energy * 40}%, ${50 + brightness * 20}%, 0.2)`
    ctx.lineTo(width, centerY)
    ctx.lineTo(0, centerY)
    ctx.closePath()
    ctx.fill()
    ctx.globalAlpha = 1
  }

  const drawParameterIndicators = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    const indicatorSize = 8
    const margin = 20

    // 能量指示器 (左上)
    ctx.fillStyle = `hsla(0, ${60 + energy * 40}%, ${50 + energy * 30}%, ${0.6 + energy * 0.4})`
    ctx.beginPath()
    ctx.arc(margin, margin, indicatorSize * (0.5 + energy * 0.5), 0, Math.PI * 2)
    ctx.fill()

    // 明暗指示器 (右上)
    ctx.fillStyle = `hsla(60, 70%, ${30 + brightness * 50}%, ${0.6 + brightness * 0.4})`
    ctx.beginPath()
    ctx.arc(width - margin, margin, indicatorSize * (0.5 + brightness * 0.5), 0, Math.PI * 2)
    ctx.fill()

    // 速度指示器 (左下) - 旋转效果
    const speedAngle = (Date.now() * speed * 0.01) % (Math.PI * 2)
    ctx.save()
    ctx.translate(margin, height - margin)
    ctx.rotate(speedAngle)
    ctx.fillStyle = `hsla(120, ${60 + speed * 40}%, ${50 + speed * 20}%, ${0.6 + speed * 0.4})`
    ctx.fillRect(-indicatorSize / 2, -indicatorSize / 2, indicatorSize, indicatorSize)
    ctx.restore()
  }

  return (
    <div className={styles.visualizer}>
      <div className={styles.header}>
        <h3 className={styles.title}>音频可视化</h3>
        <div className={styles.modeToggle}>
          <button
            className={`${styles.modeButton} ${visualMode === 'spectrum' ? styles.active : ''}`}
            onClick={() => setVisualMode('spectrum')}
          >
            频谱
          </button>
          <button
            className={`${styles.modeButton} ${visualMode === 'waveform' ? styles.active : ''}`}
            onClick={() => setVisualMode('waveform')}
          >
            波形
          </button>
        </div>
      </div>

      <div className={styles.canvasContainer}>
        <canvas ref={canvasRef} className={styles.canvas} />

        <div className={styles.indicators}>
          <div className={styles.indicator}>
            <div
              className={styles.indicatorDot}
              style={{
                backgroundColor: `hsla(0, ${60 + energy * 40}%, ${50 + energy * 30}%, ${0.6 + energy * 0.4})`,
              }}
            />
            <span className={styles.indicatorLabel}>能量</span>
          </div>
          <div className={styles.indicator}>
            <div
              className={styles.indicatorDot}
              style={{
                backgroundColor: `hsla(60, 70%, ${30 + brightness * 50}%, ${0.6 + brightness * 0.4})`,
              }}
            />
            <span className={styles.indicatorLabel}>明暗</span>
          </div>
          <div className={styles.indicator}>
            <div
              className={styles.indicatorDot}
              style={{
                backgroundColor: `hsla(120, ${60 + speed * 40}%, ${50 + speed * 20}%, ${0.6 + speed * 0.4})`,
              }}
            />
            <span className={styles.indicatorLabel}>速度</span>
          </div>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>模式</span>
          <span className={styles.statValue}>
            {visualMode === 'spectrum' ? '频谱分析' : '波形显示'}
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>状态</span>
          <span className={styles.statValue}>{isPlaying ? '播放中' : '已暂停'}</span>
        </div>
      </div>
    </div>
  )
}

export default AudioVisualizer
