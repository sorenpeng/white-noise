import React, { useEffect, useState } from 'react';
import { useRitualRadio } from '../hooks/useRitualRadio';
import { useAudioEngine } from '../hooks/useAudioEngine';
import RitualCanvas from '../components/RitualCanvas';
import BreathingText from '../components/BreathingText';
import ShaderBackground from '../components/ShaderBackground';
import PulsingCircle from '../components/PulsingCircle';
import Toast from '../components/Toast';

export default function Home() {
  const {
    state: ritualState,
    startDrawing,
    addTrajectoryPoint,
    endDrawing,
    resetToIdle,
    hideToast,
    formatCountdown,
    currentTrajectory
  } = useRitualRadio();

  const {
    state: audioState,
    updateParameters,
    togglePlayback,
    isInitialized
  } = useAudioEngine();



  // 当情绪参数生成时，更新音频参数并开始播放
  useEffect(() => {
    if (ritualState.emotionParams && ritualState.currentState === 'playing') {
      const { energy, brightness, tempo } = ritualState.emotionParams;
      
      // 映射到音频参数
      updateParameters({
        energy,
        brightness,
        speed: tempo
      });
      
      // 如果音频未初始化或未播放，则开始播放
      if (!audioState.isPlaying) {
        togglePlayback();
      }
    }
  }, [ritualState.emotionParams, ritualState.currentState, updateParameters, togglePlayback, audioState.isPlaying]);

  // 渲染不同状态的内容
  const renderContent = () => {
    switch (ritualState.currentState) {
      case 'idle':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <BreathingText 
              text="把今天的心情画成一笔"
              emotionParams={null}
              isPlaying={false}
              className="mb-8"
            />
            <p className="text-white/60 text-lg max-w-md">
              在屏幕上画出一条线，表达你此刻的情绪
            </p>
            <div className="mt-8 w-16 h-16 border-2 border-white/30 rounded-full flex items-center justify-center animate-pulse">
              <div className="w-2 h-2 bg-white/50 rounded-full"></div>
            </div>
          </div>
        );
      
      case 'drawing':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-white/80 text-lg mb-4">继续画下去...</p>
          </div>
        );
      
      case 'generating':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="animate-spin w-8 h-8 border-2 border-white/30 border-t-white/80 rounded-full mb-4"></div>
            <p className="text-white/80 text-lg">正在感受你的情绪...</p>
          </div>
        );
      
      case 'playing':
        return (
          <div className="flex flex-col items-center justify-center h-full relative">
            {/* 倒计时显示 */}
            <div className="absolute top-8 left-8">
              <div className="text-white/60 text-2xl font-mono">
                {formatCountdown(ritualState.countdown)}
              </div>
            </div>
            
            {/* 重置按钮 */}
            <button
              onClick={resetToIdle}
              className="absolute top-8 right-8 text-white/60 hover:text-white/80 transition-colors duration-200 text-lg"
              title="再来一笔"
            >
              ↺ 再来一笔
            </button>
            
            {/* 主要内容 */}
            <BreathingText 
              text="Ritual Radio"
              emotionParams={ritualState.emotionParams}
              isPlaying={true}
              className="mb-4"
            />
            <p className="text-white/60 text-lg">正在播放</p>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <ShaderBackground 
      emotionParams={ritualState.emotionParams}
      isPlaying={ritualState.currentState === 'playing'}
    >
      {/* Canvas绘制层 - z-index介于背景和前景UI之间 */}
      {(ritualState.currentState === 'idle' || ritualState.currentState === 'drawing') && (
        <div className="absolute inset-0 z-10">
          <RitualCanvas
            isDrawing={ritualState.currentState === 'drawing'}
            onStartDrawing={startDrawing}
            onAddPoint={addTrajectoryPoint}
            onEndDrawing={endDrawing}
            currentTrajectory={currentTrajectory}
            brightness={ritualState.emotionParams?.brightness || 50}
          />
        </div>
      )}
      
      {/* 主要内容区域，包含状态文本等 */}
      <div className="relative z-20 w-full h-full">
        {renderContent()}
      </div>
      
      {/* 其他顶层UI，如脉冲圆圈 */}
      <div className="absolute bottom-8 right-8 z-30">
        <PulsingCircle 
          emotionParams={ritualState.emotionParams}
          isPlaying={ritualState.currentState === 'playing'}
        />
      </div>
      
      {/* Toast提示 */}
      <div className="relative z-40">
        <Toast
          message={ritualState.toastMessage}
          show={ritualState.showToast}
          onHide={hideToast}
          type="info"
        />
      </div>
    </ShaderBackground>
  );
}