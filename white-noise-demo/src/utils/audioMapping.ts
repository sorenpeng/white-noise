import { ParameterMapping } from '../types/audio';

/**
 * Ritual Radio 音频参数映射配置
 * 根据交互方案中定义的映射关系
 */
export const parameterMapping: ParameterMapping = {
  energy: {
    // Energy (0-100) -> master.gain (0.3-0.8)
    // 低能量=温柔近耳，高能量=空间感拉满
    masterGain: (value: number) => 0.3 + (value / 100) * 0.5,
    // Energy (0-100) -> reverb.wet (0.3-0.8)
    reverbWet: (value: number) => 0.3 + (value / 100) * 0.5,
  },
  brightness: {
    // Brightness (0-100) -> Low-pass Cutoff (300Hz-4kHz)
    // 暗=朦胧低频，亮=晶莹高频
    filterFrequency: (value: number) => 300 + (value / 100) * 3700,
    // Brightness (0-100) -> reverb.preDelay (0-0.05 seconds)
    reverbPreDelay: (value: number) => (value / 100) * 0.05,
  },
  speed: {
    // Speed/Tempo (0-100) -> Transport.bpm (50-110 BPM)
    // 呼吸慢→快，文字动画同步
    transportBpm: (value: number) => 50 + (value / 100) * 60,
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