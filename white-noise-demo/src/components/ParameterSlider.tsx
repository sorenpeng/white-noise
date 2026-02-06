import type React from 'react'
import styles from '../styles/ParameterSlider.module.css'
import type { SliderProps } from '../types/audio'

const ParameterSlider: React.FC<SliderProps> = ({
  label,
  value,
  min,
  max,
  onChange,
  className = '',
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number.parseFloat(event.target.value)
    onChange(newValue)
  }

  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div className={`${styles.sliderContainer} ${className}`}>
      <div className={styles.labelContainer}>
        <label className={styles.label}>{label}</label>
        <span className={styles.value}>{Math.round(value)}</span>
      </div>

      <div className={styles.sliderWrapper}>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={handleChange}
          className={styles.slider}
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${percentage}%, #1e293b ${percentage}%, #1e293b 100%)`,
          }}
        />

        {/* 自定义滑块轨道 */}
        <div className={styles.track}>
          <div className={styles.progress} style={{ width: `${percentage}%` }} />
        </div>

        {/* 自定义滑块按钮 */}
        <div className={styles.thumb} style={{ left: `calc(${percentage}% - 12px)` }} />
      </div>

      {/* 刻度标记 */}
      <div className={styles.ticks}>
        <span className={styles.tick}>0</span>
        <span className={styles.tick}>25</span>
        <span className={styles.tick}>50</span>
        <span className={styles.tick}>75</span>
        <span className={styles.tick}>100</span>
      </div>
    </div>
  )
}

export default ParameterSlider
