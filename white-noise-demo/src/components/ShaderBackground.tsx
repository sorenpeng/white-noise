'use client'

import { MeshGradient } from '@paper-design/shaders-react'
import type React from 'react'
import { useEffect, useRef, useState } from 'react'

interface ShaderBackgroundProps {
  children: React.ReactNode
  emotionParams?: {
    energy: number
    brightness: number
    tempo: number
  } | null
  isPlaying?: boolean
}

export default function ShaderBackground({
  children,
  emotionParams,
  isPlaying,
}: ShaderBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    const handleMouseEnter = () => setIsActive(true)
    const handleMouseLeave = () => setIsActive(false)

    const container = containerRef.current
    if (container) {
      container.addEventListener('mouseenter', handleMouseEnter)
      container.addEventListener('mouseleave', handleMouseLeave)
    }

    return () => {
      if (container) {
        container.removeEventListener('mouseenter', handleMouseEnter)
        container.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [])

  // 根据情绪参数动态调整颜色和速度
  const getColors = () => {
    if (!emotionParams) {
      // 默认调色板：白色、红色、橙色的活力搭配
      return ['#FFFFFF', '#FF4500', '#FFA500', '#FF6347', '#FFD700']
    }

    const { energy, brightness } = emotionParams

    if (energy > 70) {
      // 高能量：更强烈的红色、橙色系
      return ['#FFFFFF', '#FF0000', '#FF4500', '#DC143C', '#FF8C00']
    } else if (energy > 40) {
      // 中等能量：温和的白色、红色、橙色系
      return ['#FFFFFF', '#FF6347', '#FFA500', '#FF7F50', '#FFD700']
    } else {
      // 低能量：柔和的白色、浅红色、浅橙色系
      return ['#FFFFFF', '#FFB6C1', '#FFDAB9', '#FFA07A', '#FFFFE0']
    }
  }

  const getSpeed = () => {
    if (!emotionParams) return 0.3
    return Math.max(0.1, Math.min(1.0, emotionParams.tempo / 100))
  }

  const getOpacity = () => {
    if (!emotionParams) return 0.6
    return Math.max(0.3, Math.min(0.8, emotionParams.brightness / 100))
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-black relative overflow-hidden">
      {/* SVG Filters */}
      <svg className="absolute inset-0 w-0 h-0">
        <defs>
          <filter id="glass-effect" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence baseFrequency="0.005" numOctaves="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.3" />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0.02
                      0 1 0 0 0.02
                      0 0 1 0 0.05
                      0 0 0 0.9 0"
              result="tint"
            />
          </filter>
          <filter id="gooey-filter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="gooey"
            />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Background Shaders */}
      <MeshGradient
        className="absolute inset-0 w-full h-full"
        colors={getColors()}
        speed={getSpeed()}
        style={{ pointerEvents: 'none' }}
      />
      <MeshGradient
        className="absolute inset-0 w-full h-full"
        colors={['#000000', '#ffffff', ...getColors().slice(1, 3), '#000000']}
        speed={getSpeed() * 0.7}
        style={{ pointerEvents: 'none', opacity: getOpacity() }}
      />

      {children}
    </div>
  )
}
