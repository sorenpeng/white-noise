import { useCallback, useEffect, useRef, useState } from 'react'
import {
  EmotionParameters,
  type RitualRadioAppState,
  RitualRadioState,
  type TrajectoryData,
  type TrajectoryPoint,
} from '../types/ritualRadio'
import {
  calculateTrajectoryLength,
  extractEmotionParameters,
  isTrajectoryValid,
} from '../utils/trajectoryAnalysis'

const initialState: RitualRadioAppState = {
  currentState: 'idle',
  trajectory: null,
  emotionParams: null,
  countdown: 0,
  showToast: false,
  toastMessage: '',
}

export const useRitualRadio = () => {
  const [state, setState] = useState<RitualRadioAppState>(initialState)
  const trajectoryRef = useRef<TrajectoryPoint[]>([])
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null)

  // 开始绘制
  const startDrawing = useCallback(
    (point: TrajectoryPoint) => {
      if (state.currentState !== 'idle') return

      trajectoryRef.current = [point]
      setState((prev) => ({
        ...prev,
        currentState: 'drawing',
        showToast: false,
      }))
    },
    [state.currentState]
  )

  // 添加轨迹点
  const addTrajectoryPoint = useCallback(
    (point: TrajectoryPoint) => {
      if (state.currentState !== 'drawing') return

      trajectoryRef.current.push(point)
    },
    [state.currentState]
  )

  // 结束绘制，开始生成
  const endDrawing = useCallback(() => {
    if (state.currentState !== 'drawing') return

    const points = trajectoryRef.current
    if (points.length < 2) {
      // 轨迹太短，显示提示
      setState((prev) => ({
        ...prev,
        currentState: 'idle',
        showToast: true,
        toastMessage: '再长一点，让我听见你的情绪～',
      }))
      return
    }

    const totalLength = calculateTrajectoryLength(points)
    const trajectory: TrajectoryData = {
      points,
      startTime: points[0].timestamp,
      endTime: points[points.length - 1].timestamp,
      totalLength,
    }

    if (!isTrajectoryValid(trajectory)) {
      setState((prev) => ({
        ...prev,
        currentState: 'idle',
        showToast: true,
        toastMessage: '再长一点，让我听见你的情绪～',
      }))
      return
    }

    // 进入生成状态
    setState((prev) => ({
      ...prev,
      currentState: 'generating',
      trajectory,
    }))

    // 模拟生成过程（800ms内完成）
    setTimeout(
      () => {
        const emotionParams = extractEmotionParameters(trajectory)

        setState((prev) => ({
          ...prev,
          currentState: 'playing',
          emotionParams,
          countdown: 300, // 5分钟 = 300秒
        }))

        // 开始倒计时
        startCountdown()
      },
      Math.random() * 500 + 300
    ) // 300-800ms随机延迟
  }, [state.currentState])

  // 开始倒计时
  const startCountdown = useCallback(() => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current)
    }

    countdownTimerRef.current = setInterval(() => {
      setState((prev) => {
        if (prev.countdown <= 1) {
          // 倒计时结束，回到idle状态
          if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current)
            countdownTimerRef.current = null
          }
          return {
            ...initialState,
            showToast: true,
            toastMessage: '进入寝前循环模式',
          }
        }
        return {
          ...prev,
          countdown: prev.countdown - 1,
        }
      })
    }, 1000)
  }, [])

  // 重置到idle状态
  const resetToIdle = useCallback(() => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current)
      countdownTimerRef.current = null
    }

    trajectoryRef.current = []
    setState(initialState)
  }, [])

  // 隐藏提示
  const hideToast = useCallback(() => {
    setState((prev) => ({ ...prev, showToast: false }))
  }, [])

  // 格式化倒计时显示
  const formatCountdown = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }, [])

  // 清理定时器
  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current)
      }
    }
  }, [])

  return {
    state,
    startDrawing,
    addTrajectoryPoint,
    endDrawing,
    resetToIdle,
    hideToast,
    formatCountdown,
    currentTrajectory: trajectoryRef.current,
  }
}
