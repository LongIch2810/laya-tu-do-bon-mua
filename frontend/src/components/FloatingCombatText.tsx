'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Season, ClassificationResult } from '@/types';

interface FloatingTag {
  id: string;
  text: string;
  xOffset: number;
}

interface FloatingCombatTextProps {
  mode: 'idle' | 'processing' | 'success' | 'error' | 'binImpact';
  result?: ClassificationResult | null;
  elapsedSeconds?: number;
  errorMsg?: string;
}

const PROCESSING_TEXTS = [
  '◈ AI ĐANG PHÂN TÍCH...',
  'ĐANG QUÉT VẢI',
  '◉ ĐANG XỬ LÝ...',
  '✦ AI HOẠT ĐỘNG',
  'ĐANG ƯỚC TÍNH ĐỘ ẤM...',
  'MÔ HÌNH LAYA',
  'PHÂN LOẠI 4 MÙA',
];

export const FloatingCombatText: React.FC<FloatingCombatTextProps> = ({
  mode,
  result,
  elapsedSeconds = 0,
  errorMsg,
}) => {
  const [processingTags, setProcessingTags] = useState<FloatingTag[]>([]);

  // 1. Chế độ Processing: Sinh ra các thẻ tag nổi kiểu combat text
  useEffect(() => {
    if (mode !== 'processing') {
      return;
    }

    const interval = setInterval(() => {
      const randomText =
        PROCESSING_TEXTS[Math.floor(Math.random() * PROCESSING_TEXTS.length)];
      const xOffset = Math.floor(Math.random() * 160) - 80;

      const newTag: FloatingTag = {
        id: Math.random().toString(36).substring(7),
        text: randomText,
        xOffset,
      };

      setProcessingTags((prev) => [...prev.slice(-3), newTag]);
    }, 450);

    return () => clearInterval(interval);
  }, [mode]);

  // Cấu hình Gradient Atmosphere theo chuẩn DESIGN.md
  const getSeasonTheme = (season?: Season) => {
    switch (season) {
      case 'SPRING':
        return {
          name: 'XUÂN',
          icon: '🌸',
          gradient: 'from-[#d44df0] to-[#ff5577]',
          glowClass: 'glow-spring',
          flashBg: 'bg-[#d44df0]/25',
          borderAccent: 'border-[#d44df0]/60',
          textColor: 'text-[#d44df0]',
        };
      case 'SUMMER':
        return {
          name: 'HẠ',
          icon: '☀️',
          gradient: 'from-[#ff7a3d] to-[#ffa44a]',
          glowClass: 'glow-summer',
          flashBg: 'bg-[#ff7a3d]/25',
          borderAccent: 'border-[#ff7a3d]/60',
          textColor: 'text-[#ff7a3d]',
        };
      case 'AUTUMN':
        return {
          name: 'THU',
          icon: '🍂',
          gradient: 'from-[#6a4cf5] to-[#9d7cf7]',
          glowClass: 'glow-autumn',
          flashBg: 'bg-[#6a4cf5]/25',
          borderAccent: 'border-[#6a4cf5]/60',
          textColor: 'text-[#6a4cf5]',
        };
      case 'WINTER':
      default:
        return {
          name: 'ĐÔNG',
          icon: '❄️',
          gradient: 'from-[#0099ff] to-[#60c5ff]',
          glowClass: 'glow-winter',
          flashBg: 'bg-[#0099ff]/25',
          borderAccent: 'border-[#0099ff]/60',
          textColor: 'text-[#0099ff]',
        };
    }
  };

  const seasonTheme = result?.season ? getSeasonTheme(result.season) : null;

  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center">
      {/* 1. Real-time Floating Tags khi đang scan */}
      {mode === 'processing' && (
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Đồng hồ đo thời gian chờ thực tế */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-10 px-3 py-1 rounded-full bg-[#141414] border border-[#262626] text-[#0099ff] font-mono text-[11px] font-semibold shadow-lg backdrop-blur-md flex items-center gap-2"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#0099ff] animate-ping" />
            <span>ĐANG QUÉT: {elapsedSeconds.toFixed(2)}s</span>
          </motion.div>

          <AnimatePresence>
            {processingTags.map((tag) => (
              <motion.div
                key={tag.id}
                initial={{ opacity: 0, y: 15, scale: 0.7, x: tag.xOffset }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  y: -80,
                  scale: [0.7, 1.05, 1, 0.9],
                  x: tag.xOffset * 1.15,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.3, ease: 'easeOut' }}
                className="absolute px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium tracking-wide bg-[#141414]/90 text-white border border-[#262626] shadow-md backdrop-blur-sm"
              >
                {tag.text}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* 2. Critical Hit Impact khi có kết quả từ Laya */}
      {mode === 'success' && seasonTheme && result && (
        <div className="relative flex flex-col items-center justify-center">
          {/* Scanner Flash Effect */}
          <div
            className={`absolute w-80 h-80 rounded-full blur-3xl animate-impact-flash pointer-events-none ${seasonTheme.flashBg}`}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.3, y: 25 }}
            animate={{
              opacity: [0, 1, 1, 0.95],
              scale: [0.3, 1.35, 1.1, 1],
              y: -40,
            }}
            transition={{
              duration: 1.6,
              times: [0, 0.25, 0.5, 1],
              ease: 'easeOut',
            }}
            className="flex flex-col items-center select-none"
          >
            {/* Season Icon nảy lên */}
            <motion.div
              initial={{ rotate: -15, scale: 0.5 }}
              animate={{ rotate: 0, scale: 1.15 }}
              transition={{ type: 'spring', damping: 10, stiffness: 200 }}
              className="text-5xl sm:text-6xl drop-shadow-[0_0_20px_rgba(255,255,255,0.7)] mb-0.5"
            >
              {seasonTheme.icon}
            </motion.div>

            {/* +1 <TÊN MÙA> - Typography kiểu Framer Poster Display */}
            <div
              className={`text-4xl sm:text-5xl font-black tracking-display-xxl uppercase bg-gradient-to-r ${seasonTheme.gradient} bg-clip-text text-transparent drop-shadow ${seasonTheme.glowClass}`}
            >
              +1 {seasonTheme.name}
            </div>

            {/* Confidence % & Inference ms */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.35 }}
              className="flex items-center gap-2 mt-2.5"
            >
              {/* Confidence Badge */}
              <div className="px-2.5 py-0.5 rounded-full bg-[#141414] border border-[#262626] text-[11px] font-mono shadow-md flex items-center gap-1.5">
                  <span className="text-[#888888]">TIN CẬY:</span>
                <span className="font-bold text-white">
                  {result.confidence !== null && result.confidence !== undefined
                    ? `${(result.confidence * 100).toFixed(1)}%`
                    : 'KHÔNG CÓ'}
                </span>
              </div>

              {/* Inference Time Badge */}
              <div className="px-2.5 py-0.5 rounded-full bg-[#141414] border border-[#262626] text-[11px] font-mono shadow-md flex items-center gap-1.5">
                  <span className="text-[#888888]">SUY LUẬN:</span>
                <span className="font-bold text-[#0099ff]">
                  {result.inference_ms.toFixed(1)}ms
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      )}

      {/* 3. Lỗi phân loại */}
      {mode === 'error' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: 10 }}
          animate={{ opacity: 1, scale: 1.1, y: -20 }}
          exit={{ opacity: 0 }}
          className="flex flex-col items-center px-4 py-2 rounded-xl bg-[#141414] border border-[#ff5577] text-[#ff5577] font-mono shadow-xl"
        >
          <span className="text-xl mb-0.5">⚠️</span>
          <span className="text-sm font-bold tracking-headline">QUÉT THẤT BẠI</span>
          <span className="text-[10px] text-[#999999]">{errorMsg || 'Lỗi phân loại'}</span>
        </motion.div>
      )}
    </div>
  );
};
