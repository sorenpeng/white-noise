import type React from 'react'
import { useEffect, useState } from 'react'
import type { EmotionParameters } from '../types/ritualRadio'
import styles from './DynamicBackground.module.css'

interface DynamicBackgroundProps {
  emotionParams: EmotionParameters | null
  isPlaying: boolean
  isDarkMode?: boolean
}

const DynamicBackground: React.FC<DynamicBackgroundProps> = ({
  emotionParams,
  isPlaying,
  isDarkMode = false,
}) => {
  const [gradientAngle, setGradientAngle] = useState(0)

  // 背景渐变旋转动画
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setGradientAngle((prev) => (prev + 0.5) % 360) // 每8秒旋转360度
    }, 8000 / 720) // 720步完成一次旋转

    return () => clearInterval(interval)
  }, [isPlaying])

  // 默认背景（idle状态）
  if (!emotionParams || !isPlaying) {
    const baseColor = isDarkMode ? 'rgb(15, 23, 42)' : 'rgb(248, 250, 252)'
    const accentColor = isDarkMode ? 'rgb(30, 41, 59)' : 'rgb(226, 232, 240)'

    return (
      <div
        className="fixed inset-0 -z-10 transition-all duration-1000 ease-out"
        style={{
          background: `linear-gradient(135deg, ${baseColor}, ${accentColor})`,
        }}
      />
    )
  }

  // 根据情绪参数计算背景颜色
  const hue1 = 200 + (emotionParams.energy / 100) * 140 // 200-340度 (冷静→热忱)
  const hue2 = (hue1 + 60) % 360 // 互补色

  const saturation = 30 + (emotionParams.brightness / 100) * 40 // 30-70%
  const lightness = 15 + (emotionParams.tempo / 100) * 50 // 15-65%

  // 创建渐变色
  const color1 = `hsl(${hue1}, ${saturation}%, ${lightness}%)`
  const color2 = `hsl(${hue2}, ${saturation * 0.8}%, ${lightness * 1.2}%)`
  const color3 = `hsl(${(hue1 + 180) % 360}, ${saturation * 0.6}%, ${lightness * 0.8}%)`

  return (
    <div
      className="fixed inset-0 -z-10 transition-all duration-1000 ease-out"
      style={{
        background: `linear-gradient(${gradientAngle}deg, ${color1}, ${color2}, ${color3})`,
        backgroundSize: '400% 400%',
        animation: isPlaying ? `${styles.gradientShift} 16s ease-in-out infinite` : 'none',
      }}
    >
      {/* 添加一些纹理层 */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(circle at 20% 80%, hsla(${hue1}, 70%, 60%, 0.3) 0%, transparent 50%),
                       radial-gradient(circle at 80% 20%, hsla(${hue2}, 70%, 60%, 0.3) 0%, transparent 50%),
                       radial-gradient(circle at 40% 40%, hsla(${(hue1 + 120) % 360}, 70%, 60%, 0.2) 0%, transparent 50%)`,
        }}
      />

      {/* 动态光斑效果 */}
      {isPlaying && (
        <>
          <div
            className="absolute w-96 h-96 rounded-full blur-3xl opacity-30 animate-pulse"
            style={{
              background: `radial-gradient(circle, hsla(${hue1}, 80%, 70%, 0.4) 0%, transparent 70%)`,
              left: '10%',
              top: '20%',
              animationDuration: `${3 + emotionParams.tempo / 50}s`,
            }}
          />
          <div
            className="absolute w-64 h-64 rounded-full blur-2xl opacity-25 animate-pulse"
            style={{
              background: `radial-gradient(circle, hsla(${hue2}, 80%, 70%, 0.4) 0%, transparent 70%)`,
              right: '15%',
              bottom: '25%',
              animationDuration: `${4 + emotionParams.energy / 50}s`,
              animationDelay: '1s',
            }}
          />
        </>
      )}
    </div>
  )
}

export default DynamicBackground
