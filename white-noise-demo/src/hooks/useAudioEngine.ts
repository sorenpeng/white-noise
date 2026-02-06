import { useCallback, useEffect, useRef, useState } from 'react'
import * as Tone from 'tone'
import type { AudioEngineState, AudioParameters, AudioVisualizationData } from '../types/audio'
import type { EmotionParameters } from '../types/ritualRadio'
import { debounce, parameterMapping } from '../utils/audioMapping'

const initialParameters: AudioParameters = {
  energy: 50,
  brightness: 50,
  speed: 50,
}

const initialState: AudioEngineState = {
  isPlaying: false,
  volume: 0.7,
  parameters: initialParameters,
}

export const useAudioEngine = () => {
  const [state, setState] = useState<AudioEngineState>(initialState)
  const [isInitialized, setIsInitialized] = useState(false)

  // 音频节点引用
  const noiseRef = useRef<Tone.Noise | null>(null)
  const oscillatorRef = useRef<Tone.Oscillator | null>(null)
  const filterRef = useRef<Tone.Filter | null>(null)
  const reverbRef = useRef<Tone.Reverb | null>(null)
  const masterGainRef = useRef<Tone.Gain | null>(null)
  const analyserRef = useRef<Tone.Analyser | null>(null)

  // 初始化音频引擎
  const initializeAudio = useCallback(async () => {
    try {
      // 启动音频上下文
      await Tone.start()

      // 创建音频节点
      const noise = new Tone.Noise('pink').start()
      const oscillator = new Tone.Oscillator(220, 'sine').start()
      const filter = new Tone.Filter(2000, 'lowpass')
      const reverb = new Tone.Reverb(2)
      const masterGain = new Tone.Gain(0.5)
      const analyser = new Tone.Analyser('waveform', 1024)

      // 等待混响加载
      await reverb.generate()

      // 连接音频信号链: 声源 -> 滤波器 -> 混响 -> 主增益 -> 分析器 -> 输出
      noise.connect(filter)
      oscillator.connect(filter)
      filter.connect(reverb)
      reverb.connect(masterGain)
      masterGain.connect(analyser)
      analyser.toDestination()

      // 设置初始音量
      noise.volume.value = -20
      oscillator.volume.value = -30

      // 保存引用
      noiseRef.current = noise
      oscillatorRef.current = oscillator
      filterRef.current = filter
      reverbRef.current = reverb
      masterGainRef.current = masterGain
      analyserRef.current = analyser

      // 应用初始参数
      updateAudioParameters({
        energy: initialParameters.energy,
        brightness: initialParameters.brightness,
        tempo: initialParameters.speed,
      })

      setIsInitialized(true)
    } catch (error) {
      console.error('音频引擎初始化失败:', error)
    }
  }, [])

  // 更新音频参数 - 支持情绪参数
  const updateAudioParameters = useCallback(
    (emotionParams: EmotionParameters) => {
      if (!isInitialized) return

      const audioParams: AudioParameters = {
        energy: emotionParams.energy,
        brightness: emotionParams.brightness,
        speed: emotionParams.tempo,
      }

      try {
        // Energy 参数映射
        if (masterGainRef.current) {
          const gainValue = parameterMapping.energy.masterGain(audioParams.energy)
          masterGainRef.current.gain.rampTo(gainValue, 0.2)
        }

        if (reverbRef.current) {
          const wetValue = parameterMapping.energy.reverbWet(audioParams.energy)
          reverbRef.current.wet.rampTo(wetValue, 0.2)
        }

        // Brightness 参数映射
        if (filterRef.current) {
          const freqValue = parameterMapping.brightness.filterFrequency(audioParams.brightness)
          filterRef.current.frequency.rampTo(freqValue, 0.2)
        }

        if (reverbRef.current) {
          const preDelayValue = parameterMapping.brightness.reverbPreDelay(audioParams.brightness)
          reverbRef.current.preDelay = preDelayValue
        }

        // Speed 参数映射
        const bpmValue = parameterMapping.speed.transportBpm(audioParams.speed)
        Tone.Transport.bpm.rampTo(bpmValue, 0.2)

        // 根据速度调整振荡器频率
        if (oscillatorRef.current) {
          const oscFreq = 220 + (audioParams.speed - 50) * 2
          oscillatorRef.current.frequency.rampTo(oscFreq, 0.2)
        }

        // 更新状态
        setState((prev) => ({
          ...prev,
          parameters: audioParams,
        }))
      } catch (error) {
        console.error('更新音频参数失败:', error)
      }
    },
    [isInitialized]
  )

  // 防抖的参数更新函数
  const debouncedUpdateParameters = useCallback(debounce(updateAudioParameters, 100), [
    updateAudioParameters,
  ])

  // 更新参数状态和音频
  const updateParameters = useCallback(
    (emotionParams: EmotionParameters) => {
      debouncedUpdateParameters(emotionParams)
    },
    [debouncedUpdateParameters]
  )

  // 切换播放状态
  const togglePlayback = useCallback(async () => {
    if (!isInitialized) {
      await initializeAudio()
      return
    }

    try {
      if (state.isPlaying) {
        // 停止播放
        if (noiseRef.current) noiseRef.current.volume.rampTo(Number.NEGATIVE_INFINITY, 0.1)
        if (oscillatorRef.current)
          oscillatorRef.current.volume.rampTo(Number.NEGATIVE_INFINITY, 0.1)
        Tone.Transport.stop()
      } else {
        // 开始播放
        if (noiseRef.current) noiseRef.current.volume.rampTo(-20, 0.1)
        if (oscillatorRef.current) oscillatorRef.current.volume.rampTo(-30, 0.1)
        Tone.Transport.start()
      }

      setState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }))
    } catch (error) {
      console.error('切换播放状态失败:', error)
    }
  }, [isInitialized, state.isPlaying, initializeAudio])

  // 设置主音量
  const setVolume = useCallback((volume: number) => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.rampTo(volume, 0.1)
    }
    setState((prev) => ({ ...prev, volume }))
  }, [])

  // 获取音频分析数据
  const getAnalyserData = useCallback((): AudioVisualizationData | null => {
    if (!analyserRef.current) return null

    const waveformData = analyserRef.current.getValue() as Float32Array
    // 将Float32Array转换为Uint8Array格式
    const waveformUint8 = new Uint8Array(waveformData.length)
    for (let i = 0; i < waveformData.length; i++) {
      waveformUint8[i] = Math.floor((waveformData[i] + 1) * 127.5)
    }

    // 创建频率数据（模拟FFT数据）
    const frequencyData = new Uint8Array(512)
    for (let i = 0; i < frequencyData.length; i++) {
      // 基于波形数据生成频率数据的近似值
      const index = Math.floor((i / frequencyData.length) * waveformData.length)
      frequencyData[i] = Math.floor(Math.abs(waveformData[index] || 0) * 255)
    }

    return {
      frequencyData,
      waveformData: waveformUint8,
    }
  }, [])

  // 清理资源
  useEffect(() => {
    return () => {
      if (noiseRef.current) {
        noiseRef.current.dispose()
      }
      if (oscillatorRef.current) {
        oscillatorRef.current.dispose()
      }
      if (filterRef.current) {
        filterRef.current.dispose()
      }
      if (reverbRef.current) {
        reverbRef.current.dispose()
      }
      if (masterGainRef.current) {
        masterGainRef.current.dispose()
      }
      if (analyserRef.current) {
        analyserRef.current.dispose()
      }
    }
  }, [])

  return {
    state,
    updateParameters,
    updateAudioParameters,
    togglePlayback,
    setVolume,
    getAnalyserData,
    isInitialized,
  }
}
