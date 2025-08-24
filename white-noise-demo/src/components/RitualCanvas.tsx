import React, { useRef, useEffect, useCallback } from 'react';
import { TrajectoryPoint } from '../types/ritualRadio';

interface RitualCanvasProps {
  isDrawing: boolean;
  onStartDrawing: (point: TrajectoryPoint) => void;
  onAddPoint: (point: TrajectoryPoint) => void;
  onEndDrawing: () => void;
  currentTrajectory: TrajectoryPoint[];
  brightness: number; // 0-100, 用于调整光环颜色
}

const RitualCanvas: React.FC<RitualCanvasProps> = ({
  isDrawing,
  onStartDrawing,
  onAddPoint,
  onEndDrawing,
  currentTrajectory,
  brightness = 50
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const lastPointRef = useRef<TrajectoryPoint | null>(null);

  // 获取Canvas坐标
  const getCanvasPoint = useCallback((clientX: number, clientY: number): TrajectoryPoint => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, timestamp: Date.now() };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
      timestamp: Date.now()
    };
  }, []);

  // 鼠标事件处理
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const point = getCanvasPoint(e.clientX, e.clientY);
    lastPointRef.current = point;
    onStartDrawing(point);
  }, [getCanvasPoint, onStartDrawing]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    const point = getCanvasPoint(e.clientX, e.clientY);
    const lastPoint = lastPointRef.current;
    
    // 限制采样频率，避免点过密
    if (lastPoint && Date.now() - lastPoint.timestamp < 16) return; // ~60fps
    
    lastPointRef.current = point;
    onAddPoint(point);
  }, [isDrawing, getCanvasPoint, onAddPoint]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    onEndDrawing();
    lastPointRef.current = null;
  }, [isDrawing, onEndDrawing]);

  // 触摸事件处理
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const point = getCanvasPoint(touch.clientX, touch.clientY);
    lastPointRef.current = point;
    onStartDrawing(point);
  }, [getCanvasPoint, onStartDrawing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const point = getCanvasPoint(touch.clientX, touch.clientY);
    const lastPoint = lastPointRef.current;
    
    if (lastPoint && Date.now() - lastPoint.timestamp < 16) return;
    
    lastPointRef.current = point;
    onAddPoint(point);
  }, [isDrawing, getCanvasPoint, onAddPoint]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    onEndDrawing();
    lastPointRef.current = null;
  }, [isDrawing, onEndDrawing]);

  // 绘制轨迹
  const drawTrajectory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (currentTrajectory.length < 2) return;

    // 设置绘制样式
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // 根据brightness调整颜色：暗=暖橙，亮=电光蓝
    const hue = brightness < 50 ? 
      30 + (50 - brightness) * 0.4 : // 橙色范围 30-10
      200 + (brightness - 50) * 2.8; // 蓝色范围 200-340
    
    const saturation = 70 + brightness * 0.3; // 70-100%
    const lightness = 50 + brightness * 0.3;  // 50-80%
    
    // 主轨迹线
    ctx.strokeStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.6)`;
    ctx.shadowBlur = 4;
    ctx.shadowColor = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.8)`;
    
    ctx.beginPath();
    ctx.moveTo(currentTrajectory[0].x, currentTrajectory[0].y);
    
    // 使用二次贝塞尔曲线平滑连接
    for (let i = 1; i < currentTrajectory.length - 1; i++) {
      const current = currentTrajectory[i];
      const next = currentTrajectory[i + 1];
      const cpx = (current.x + next.x) / 2;
      const cpy = (current.y + next.y) / 2;
      ctx.quadraticCurveTo(current.x, current.y, cpx, cpy);
    }
    
    // 连接到最后一点
    if (currentTrajectory.length > 1) {
      const lastPoint = currentTrajectory[currentTrajectory.length - 1];
      ctx.lineTo(lastPoint.x, lastPoint.y);
    }
    
    ctx.stroke();
    
    // 绘制起点和终点的内阴影效果
    if (currentTrajectory.length > 0) {
      const startPoint = currentTrajectory[0];
      const endPoint = currentTrajectory[currentTrajectory.length - 1];
      
      ctx.shadowBlur = 30;
      ctx.shadowColor = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.3)`;
      
      // 起点
      ctx.beginPath();
      ctx.arc(startPoint.x, startPoint.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.2)`;
      ctx.fill();
      
      // 终点
      ctx.beginPath();
      ctx.arc(endPoint.x, endPoint.y, 8, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // 重置阴影
    ctx.shadowBlur = 0;
  }, [currentTrajectory, brightness]);

  // 动画循环
  const animate = useCallback(() => {
    drawTrajectory();
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [drawTrajectory]);

  // 调整Canvas尺寸
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
  }, []);

  // 初始化和清理
  useEffect(() => {
    resizeCanvas();
    animate();
    
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [resizeCanvas, animate]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        width: '100%',
        height: '100%'
      }}
    />
  );
};

export default RitualCanvas;