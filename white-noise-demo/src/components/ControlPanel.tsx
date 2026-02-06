import type React from 'react'
import styles from '../styles/ControlPanel.module.css'
import type { AudioParameters } from '../types/audio'
import ParameterSlider from './ParameterSlider'

interface ControlPanelProps {
  parameters: AudioParameters
  onParameterChange: (params: Partial<AudioParameters>) => void
}

const ControlPanel: React.FC<ControlPanelProps> = ({ parameters, onParameterChange }) => {
  const handleEnergyChange = (value: number) => {
    onParameterChange({ energy: value })
  }

  const handleBrightnessChange = (value: number) => {
    onParameterChange({ brightness: value })
  }

  const handleSpeedChange = (value: number) => {
    onParameterChange({ speed: value })
  }

  const resetParameters = () => {
    onParameterChange({
      energy: 50,
      brightness: 50,
      speed: 50,
    })
  }

  return (
    <div className={styles.controlPanel}>
      <div className={styles.header}>
        <h2 className={styles.title}>音频参数控制</h2>
        <button className={styles.resetButton} onClick={resetParameters} title="重置所有参数">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M3 21v-5h5" />
          </svg>
          重置
        </button>
      </div>

      <div className={styles.parametersGrid}>
        <div className={styles.parameterSection}>
          <div className={styles.parameterIcon}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <ParameterSlider
            label="能量 (Energy)"
            value={parameters.energy}
            min={0}
            max={100}
            onChange={handleEnergyChange}
            className={styles.energySlider}
          />
          <p className={styles.parameterDescription}>控制音频的整体音量和混响强度</p>
        </div>

        <div className={styles.parameterSection}>
          <div className={styles.parameterIcon}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          </div>
          <ParameterSlider
            label="明暗 (Brightness)"
            value={parameters.brightness}
            min={0}
            max={100}
            onChange={handleBrightnessChange}
            className={styles.brightnessSlider}
          />
          <p className={styles.parameterDescription}>调节音频的频率特性和音色明亮度</p>
        </div>

        <div className={styles.parameterSection}>
          <div className={styles.parameterIcon}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </div>
          <ParameterSlider
            label="速度 (Speed)"
            value={parameters.speed}
            min={0}
            max={100}
            onChange={handleSpeedChange}
            className={styles.speedSlider}
          />
          <p className={styles.parameterDescription}>影响音频的节奏感和振荡器频率</p>
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.statusIndicator}>
          <div className={styles.statusDot} />
          <span className={styles.statusText}>实时音频处理</span>
        </div>
      </div>
    </div>
  )
}

export default ControlPanel
