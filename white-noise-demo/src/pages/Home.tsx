import React from 'react';
import { useAudioEngine } from '../hooks/useAudioEngine';
import ControlPanel from '../components/ControlPanel';
import PlaybackControls from '../components/PlaybackControls';
import AudioVisualizer from '../components/AudioVisualizer';
import styles from '../styles/Home.module.css';

export default function Home() {
  const {
    state,
    updateParameters,
    togglePlayback,
    setVolume,
    getAnalyserData,
    isInitialized,
  } = useAudioEngine();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>白噪音生成器</h1>
          <p className={styles.subtitle}>
            通过调节能量、明暗、速度三个参数，创造您专属的白噪音体验
          </p>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.grid}>
          {/* 参数控制面板 */}
          <div className={styles.controlSection}>
            <ControlPanel
              parameters={state.parameters}
              onParameterChange={updateParameters}
            />
          </div>

          {/* 播放控制 */}
          <div className={styles.playbackSection}>
            <PlaybackControls
              state={state}
              onTogglePlayback={togglePlayback}
              onVolumeChange={setVolume}
              isInitialized={isInitialized}
            />
          </div>

          {/* 音频可视化 */}
          <div className={styles.visualizerSection}>
            <AudioVisualizer
              analyzerData={getAnalyserData()}
              isPlaying={state.isPlaying}
              energy={state.parameters.energy}
              brightness={state.parameters.brightness}
              speed={state.parameters.speed}
            />
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p className={styles.footerText}>
            使用 Tone.js 构建的实时音频处理系统
          </p>
          <div className={styles.footerLinks}>
            <span className={styles.footerLink}>React + TypeScript</span>
            <span className={styles.footerDivider}>•</span>
            <span className={styles.footerLink}>Web Audio API</span>
          </div>
        </div>
      </footer>
    </div>
  );
}