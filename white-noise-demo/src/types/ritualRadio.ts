// Ritual Radio 状态机类型定义
export type RitualRadioState = 'idle' | 'drawing' | 'generating' | 'playing'

// 手势轨迹点
export interface TrajectoryPoint {
  x: number
  y: number
  timestamp: number
  pressure?: number
}

// 轨迹数据
export interface TrajectoryData {
  points: TrajectoryPoint[]
  startTime: number
  endTime: number
  totalLength: number
}

// 从轨迹提取的情绪参数
export interface EmotionParameters {
  energy: number // 0-100, 基于整体高度差
  brightness: number // 0-100, 基于平均速度
  tempo: number // 0-100, 基于局部振幅变化率
}

// Ritual Radio 应用状态
export interface RitualRadioAppState {
  currentState: RitualRadioState
  trajectory: TrajectoryData | null
  emotionParams: EmotionParameters | null
  countdown: number // 倒计时秒数
  showToast: boolean
  toastMessage: string
}

// Canvas 绘制配置
export interface CanvasConfig {
  lineWidth: number
  lineOpacity: number
  glowRadius: number
  shadowBlur: number
}

// 视觉效果配置
export interface VisualConfig {
  fontFamily: string
  fontWeightRange: [number, number]
  gradRange: [number, number]
  backgroundHueRange: [number, number]
  backgroundSatRange: [number, number]
  backgroundLightRange: [number, number]
  gradientRotationDuration: number // 秒
}
