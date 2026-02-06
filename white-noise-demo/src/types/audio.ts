// 音频参数接口
export interface AudioParameters {
  energy: number // 0-100
  brightness: number // 0-100
  speed: number // 0-100
}

// 音频引擎状态接口
export interface AudioEngineState {
  isPlaying: boolean
  volume: number // 0-1
  parameters: AudioParameters
}

// 滑块组件属性接口
export interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
  className?: string
}

// 音频上下文接口
export interface AudioContextType {
  state: AudioEngineState
  updateParameters: (params: Partial<AudioParameters>) => void
  togglePlayback: () => void
  setVolume: (volume: number) => void
  isInitialized: boolean
}

// 音频可视化数据接口
export interface AudioVisualizationData {
  frequencyData: Uint8Array
  waveformData: Uint8Array
}

// 参数映射配置接口
export interface ParameterMapping {
  energy: {
    masterGain: (value: number) => number
    reverbWet: (value: number) => number
  }
  brightness: {
    filterFrequency: (value: number) => number
    reverbPreDelay: (value: number) => number
  }
  speed: {
    transportBpm: (value: number) => number
  }
}
