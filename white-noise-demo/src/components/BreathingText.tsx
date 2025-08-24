import React, { useEffect, useState } from 'react';
import { EmotionParameters } from '../types/ritualRadio';

interface BreathingTextProps {
  text: string;
  emotionParams: EmotionParameters | null;
  isPlaying: boolean;
  className?: string;
}

const BreathingText: React.FC<BreathingTextProps> = ({
  text,
  emotionParams,
  isPlaying,
  className = ''
}) => {
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    if (!isPlaying || !emotionParams) return;

    // 根据tempo计算呼吸频率 (50-110 BPM -> 0.83-1.83 Hz)
    const bpm = 50 + emotionParams.tempo * 0.6;
    const frequency = bpm / 60; // Hz
    const period = 1000 / frequency; // ms

    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 360);
    }, period / 360); // 每度更新一次

    return () => clearInterval(interval);
  }, [isPlaying, emotionParams]);

  if (!emotionParams) {
    return (
      <div className={`text-center ${className}`}>
        <h1 className="text-4xl md:text-6xl font-light text-white/80">
          {text}
        </h1>
      </div>
    );
  }

  // 计算动画值
  const phase = (animationPhase * Math.PI) / 180; // 转换为弧度
  const breathingCycle = (Math.sin(phase) + 1) / 2; // 0-1之间的正弦波

  // 根据emotion参数计算字体变化
  const baseWeight = 300;
  const weightRange = 600; // 300-900
  const energyAmplitude = emotionParams.energy / 100; // 0-1
  const fontWeight = baseWeight + weightRange * energyAmplitude * breathingCycle;

  const baseGrad = -50;
  const gradRange = 150; // -50 to +100
  const brightnessOffset = (emotionParams.brightness / 100) * gradRange;
  const fontGrad = baseGrad + brightnessOffset + (gradRange * 0.2 * breathingCycle);

  // 计算文字颜色（基于brightness）
  const hue = 200 + (emotionParams.brightness / 100) * 140; // 200-340度
  const saturation = 30 + (emotionParams.energy / 100) * 40; // 30-70%
  const lightness = 60 + (emotionParams.brightness / 100) * 30; // 60-90%

  return (
    <div className={`text-center ${className}`}>
      <h1 
        className="text-4xl md:text-6xl transition-all duration-75 ease-out"
        style={{
          fontFamily: '"Roboto Flex", sans-serif',
          fontWeight: Math.round(fontWeight),
          fontVariationSettings: `"GRAD" ${Math.round(fontGrad)}`,
          color: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
          textShadow: `0 0 20px hsla(${hue}, ${saturation}%, ${lightness}%, 0.3)`,
          transform: `scale(${0.95 + 0.1 * breathingCycle})`,
        }}
      >
        {text}
      </h1>
    </div>
  );
};

export default BreathingText;