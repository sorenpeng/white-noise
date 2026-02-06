import type { EmotionParameters, TrajectoryData, TrajectoryPoint } from '../types/ritualRadio'

/**
 * 计算两点之间的距离
 */
function distance(p1: TrajectoryPoint, p2: TrajectoryPoint): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
}

/**
 * 计算轨迹总长度
 */
export function calculateTrajectoryLength(points: TrajectoryPoint[]): number {
  if (points.length < 2) return 0

  let totalLength = 0
  for (let i = 1; i < points.length; i++) {
    totalLength += distance(points[i - 1], points[i])
  }
  return totalLength
}

/**
 * 从轨迹数据中提取情绪参数
 */
export function extractEmotionParameters(trajectory: TrajectoryData): EmotionParameters {
  const { points } = trajectory

  if (points.length < 2) {
    return { energy: 50, brightness: 50, tempo: 50 }
  }

  // 1. Energy: 基于整体高度差（垂直位移）
  const yValues = points.map((p) => p.y)
  const minY = Math.min(...yValues)
  const maxY = Math.max(...yValues)
  const heightDiff = maxY - minY

  // 假设屏幕高度为参考，将高度差映射到0-100
  const screenHeight = window.innerHeight
  const energy = Math.min(100, (heightDiff / screenHeight) * 200)

  // 2. Brightness: 基于平均绘制速度
  let totalDistance = 0
  let totalTime = 0

  for (let i = 1; i < points.length; i++) {
    const dist = distance(points[i - 1], points[i])
    const timeDiff = points[i].timestamp - points[i - 1].timestamp
    totalDistance += dist
    totalTime += timeDiff
  }

  const avgSpeed = totalTime > 0 ? totalDistance / totalTime : 0
  // 将速度映射到0-100，假设最大速度为2像素/毫秒
  const brightness = Math.min(100, (avgSpeed / 2) * 100)

  // 3. Tempo: 基于局部振幅变化率
  let amplitudeChanges = 0
  const windowSize = Math.max(3, Math.floor(points.length / 10)) // 动态窗口大小

  for (let i = windowSize; i < points.length - windowSize; i++) {
    // 计算当前点前后窗口内的Y值变化
    const prevWindow = points.slice(i - windowSize, i)
    const nextWindow = points.slice(i, i + windowSize)

    const prevAvgY = prevWindow.reduce((sum, p) => sum + p.y, 0) / prevWindow.length
    const nextAvgY = nextWindow.reduce((sum, p) => sum + p.y, 0) / nextWindow.length

    amplitudeChanges += Math.abs(nextAvgY - prevAvgY)
  }

  // 将振幅变化映射到0-100
  const avgAmplitudeChange =
    points.length > windowSize * 2 ? amplitudeChanges / (points.length - windowSize * 2) : 0
  const tempo = Math.min(100, (avgAmplitudeChange / 50) * 100)

  return {
    energy: Math.round(energy),
    brightness: Math.round(brightness),
    tempo: Math.round(tempo),
  }
}

/**
 * 平滑轨迹点（贝塞尔曲线插值）
 */
export function smoothTrajectory(points: TrajectoryPoint[]): TrajectoryPoint[] {
  if (points.length < 3) return points

  const smoothed: TrajectoryPoint[] = [points[0]]

  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const next = points[i + 1]

    // 简单的三点平滑
    const smoothedPoint: TrajectoryPoint = {
      x: (prev.x + curr.x + next.x) / 3,
      y: (prev.y + curr.y + next.y) / 3,
      timestamp: curr.timestamp,
      pressure: curr.pressure,
    }

    smoothed.push(smoothedPoint)
  }

  smoothed.push(points[points.length - 1])
  return smoothed
}

/**
 * 检查轨迹是否足够长（最小长度要求）
 */
export function isTrajectoryValid(trajectory: TrajectoryData): boolean {
  return trajectory.points.length >= 3 && trajectory.totalLength >= 200
}
