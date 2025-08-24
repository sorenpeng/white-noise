import { ParameterMapping } from '../types/audio';

/**
 * 音频参数映射配置
 * 根据技术架构文档中定义的映射关系
 */
export const parameterMapping: ParameterMapping = {
  energy: {
    // Energy (0-100) -> master.gain (0-1)
    masterGain: (value: number) => value / 100,
    // Energy (0-100) -> reverb.wet (0.1-0.6)
    reverbWet: (value: number) => value / 200 + 0.1,
  },
  brightness: {
    // Brightness (0-100) -> filter.frequency (200-5200 Hz)
    filterFrequency: (value: number) => 200 + value * 50,
    // Brightness (0-100) -> reverb.preDelay (0-0.1 seconds)
    reverbPreDelay: (value: number) => value / 1000,
  },
  speed: {
    // Speed (0-100) -> Transport.bpm (60-180 BPM)
    transportBpm: (value: number) => 60 + value * 1.2,
  },
};

/**
 * 限制数值在指定范围内
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * 防抖函数，用于优化音频参数更新性能
 */
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * 将线性值转换为对数刻度（用于频率等音频参数）
 */
export const linearToLog = (value: number, min: number, max: number): number => {
  const logMin = Math.log(min);
  const logMax = Math.log(max);
  const scale = (logMax - logMin) / 100;
  return Math.exp(logMin + scale * value);
};

/**
 * 将对数刻度转换为线性值
 */
export const logToLinear = (value: number, min: number, max: number): number => {
  const logMin = Math.log(min);
  const logMax = Math.log(max);
  const logValue = Math.log(value);
  return ((logValue - logMin) / (logMax - logMin)) * 100;
};