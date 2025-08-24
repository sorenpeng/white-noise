"use client"

import { PulsingBorder } from "@paper-design/shaders-react"
import { motion } from "framer-motion"

interface PulsingCircleProps {
  emotionParams?: {
    energy: number
    brightness: number
    tempo: number
  } | null
  isPlaying?: boolean
}

export default function PulsingCircle({ emotionParams, isPlaying }: PulsingCircleProps) {
  // 根据情绪参数调整颜色
  const getColors = () => {
    if (!emotionParams) {
      return ["#BEECFF", "#E77EDC", "#FF4C3E", "#00FF88", "#FFD700", "#FF6B35", "#8A2BE2"]
    }

    const { energy, brightness } = emotionParams
    
    if (energy > 70) {
      // 高能量：暖色调
      return ["#FF4C3E", "#FF6B35", "#FFD700", "#FF8C00", "#E77EDC", "#8A2BE2", "#FF1493"]
    } else if (energy > 40) {
      // 中等能量：混合色调
      return ["#BEECFF", "#E77EDC", "#FF4C3E", "#00FF88", "#FFD700", "#FF6B35", "#8A2BE2"]
    } else {
      // 低能量：冷色调
      return ["#BEECFF", "#00FF88", "#1E90FF", "#20B2AA", "#9370DB", "#4169E1", "#00CED1"]
    }
  }

  // 根据节奏调整速度
  const getSpeed = () => {
    if (!emotionParams) return 1.5
    return Math.max(0.5, Math.min(3.0, emotionParams.tempo / 50))
  }

  // 根据亮度调整强度
  const getIntensity = () => {
    if (!emotionParams) return 5
    return Math.max(2, Math.min(8, emotionParams.brightness / 12.5))
  }

  // 根据播放状态调整旋转速度
  const getRotationDuration = () => {
    if (!isPlaying) return 30
    return emotionParams ? Math.max(10, 30 - (emotionParams.energy / 5)) : 20
  }

  return (
    <div className="absolute bottom-8 right-8 z-30">
      <div className="relative w-20 h-20 flex items-center justify-center">
        {/* Pulsing Border Circle */}
        <PulsingBorder
          colors={getColors()}
          colorBack="#00000000"
          speed={getSpeed()}
          roundness={1}
          thickness={0.1}
          softness={0.2}
          intensity={getIntensity()}
          spotSize={0.1}
          pulse={0.1}
          smoke={0.5}
          smokeSize={4}
          scale={0.65}
          rotation={0}
          frame={9161408.251009725}
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
          }}
        />

        {/* Rotating Text Around the Pulsing Border */}
        <motion.svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          animate={{ rotate: 360 }}
          transition={{
            duration: getRotationDuration(),
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          style={{ transform: "scale(1.6)" }}
        >
          <defs>
            <path id="circle" d="M 50, 50 m -38, 0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
          </defs>
          <text className="text-sm fill-white/80 font-mono">
            <textPath href="#circle" startOffset="0%">
              {isPlaying ? "Ritual Radio • 正在播放 • " : "画出你的心情 • 开始创作 • "}
            </textPath>
          </text>
        </motion.svg>
      </div>
    </div>
  )
}