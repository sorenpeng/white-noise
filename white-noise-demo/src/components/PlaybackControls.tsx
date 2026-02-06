import type React from 'react'
import styles from '../styles/PlaybackControls.module.css'
import type { AudioEngineState } from '../types/audio'

interface PlaybackControlsProps {
  state: AudioEngineState
  onTogglePlayback: () => void
  onVolumeChange: (volume: number) => void
  isInitialized: boolean
}

const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  state,
  onTogglePlayback,
  onVolumeChange,
  isInitialized,
}) => {
  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const volume = Number.parseFloat(event.target.value)
    onVolumeChange(volume)
  }

  const volumePercentage = Math.round(state.volume * 100)

  return (
    <div className={styles.playbackControls}>
      <div className={styles.mainControls}>
        {/* 播放/暂停按钮 */}
        <button
          className={`${styles.playButton} ${state.isPlaying ? styles.playing : ''}`}
          onClick={onTogglePlayback}
          disabled={!isInitialized && state.isPlaying}
          title={state.isPlaying ? '暂停' : '播放'}
        >
          <div className={styles.playButtonInner}>
            {state.isPlaying ? (
              // 暂停图标
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="6" y="4" width="4" height="16" fill="currentColor" rx="1" />
                <rect x="14" y="4" width="4" height="16" fill="currentColor" rx="1" />
              </svg>
            ) : (
              // 播放图标
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <polygon points="5,3 19,12 5,21" fill="currentColor" />
              </svg>
            )}
          </div>

          {/* 播放状态指示器 */}
          {state.isPlaying && (
            <div className={styles.playingIndicator}>
              <div className={styles.wave}></div>
              <div className={styles.wave}></div>
              <div className={styles.wave}></div>
            </div>
          )}
        </button>

        {/* 状态文本 */}
        <div className={styles.statusText}>
          <span className={styles.statusLabel}>
            {!isInitialized && !state.isPlaying
              ? '点击开始'
              : state.isPlaying
                ? '正在播放'
                : '已暂停'}
          </span>
          {isInitialized && <span className={styles.statusDetail}>白噪音生成器</span>}
        </div>
      </div>

      {/* 音量控制 */}
      <div className={styles.volumeControl}>
        <div className={styles.volumeIcon}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            {state.volume === 0 ? (
              // 静音图标
              <>
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </>
            ) : state.volume < 0.5 ? (
              // 低音量图标
              <>
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              </>
            ) : (
              // 高音量图标
              <>
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              </>
            )}
          </svg>
        </div>

        <div className={styles.volumeSliderContainer}>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={state.volume}
            onChange={handleVolumeChange}
            className={styles.volumeSlider}
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${volumePercentage}%, #334155 ${volumePercentage}%, #334155 100%)`,
            }}
          />
          <div className={styles.volumeTrack}>
            <div className={styles.volumeProgress} style={{ width: `${volumePercentage}%` }} />
          </div>
        </div>

        <span className={styles.volumeValue}>{volumePercentage}%</span>
      </div>

      {/* 音频信息 */}
      <div className={styles.audioInfo}>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>能量:</span>
          <span className={styles.infoValue}>{Math.round(state.parameters.energy)}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>明暗:</span>
          <span className={styles.infoValue}>{Math.round(state.parameters.brightness)}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>速度:</span>
          <span className={styles.infoValue}>{Math.round(state.parameters.speed)}</span>
        </div>
      </div>
    </div>
  )
}

export default PlaybackControls
