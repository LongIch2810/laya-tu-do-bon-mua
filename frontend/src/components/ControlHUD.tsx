'use client';

import React from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Cpu } from 'lucide-react';
import { HealthStatus } from '@/lib/api';
import { SorterState } from '@/types';

interface ControlHUDProps {
  health: HealthStatus;
  sorterState: SorterState;
  currentIndex: number;
  totalProducts: number;
  totalInferenceMs: number;
  isMuted: boolean;
  onStart: () => void;
  onReset: () => void;
  onToggleMute: () => void;
}

export const ControlHUD: React.FC<ControlHUDProps> = ({
  health,
  sorterState,
  currentIndex,
  totalProducts,
  totalInferenceMs,
  isMuted,
  onStart,
  onReset,
  onToggleMute,
}) => {
  const isReady = health.status === 'ready';
  const isRunning =
    sorterState !== 'idle' &&
    sorterState !== 'completed' &&
    sorterState !== 'error';

  return (
    <nav className="w-full max-w-5xl mx-auto flex items-center justify-between px-3 py-1.5 rounded-full bg-[#141414]/90 backdrop-blur-md border border-[#262626] shadow-xl z-40 select-none">
      {/* 1. App Title & Model Engine Pill */}
      <div className="flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center font-bold text-xs shrink-0">
          <Cpu className="w-3.5 h-3.5 text-black" />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-xs tracking-headline text-white hidden sm:inline">
            LAYA – TỦ ĐỒ BỐN MÙA
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1c1c1c] text-[#0099ff] border border-[#262626]">
            LAYA v0.4
          </span>
        </div>
      </div>

      {/* 2. Model Status & Counters HUD */}
      <div className="flex items-center gap-3 text-xs">
        {/* Status indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1c1c1c] border border-[#262626] text-[11px] font-mono">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              health.status === 'ready'
                ? 'bg-[#22c55e] animate-pulse'
                : health.status === 'loading'
                ? 'bg-[#ff7a3d]'
                : 'bg-[#ff5577]'
            }`}
          />
          <span className="text-[#999999]">
            {health.status === 'ready'
              ? 'LAYA SẴN SÀNG'
              : health.status === 'loading'
              ? 'ĐANG TẢI AI...'
              : 'MẤT KẾT NỐI'}
          </span>
        </div>

        {/* Progress Counter */}
        <div className="flex items-center gap-1 text-[11px] font-mono text-[#999999]">
          <span>TIẾN ĐỘ:</span>
          <span className="font-semibold text-white">
            {currentIndex}/{totalProducts}
          </span>
        </div>

        {/* Real Inference Duration */}
        <div className="hidden md:flex items-center gap-1 text-[11px] font-mono text-[#999999]">
          <span>SUY LUẬN:</span>
          <span className="font-semibold text-white">
            {totalInferenceMs.toFixed(0)}ms
          </span>
        </div>
      </div>

      {/* 3. Action Controls: White Pill & Charcoal Pill */}
      <div className="flex items-center gap-2">
        {/* Mute Audio Toggle Button */}
        <button
          onClick={onToggleMute}
          title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          className="w-7 h-7 rounded-full bg-[#1c1c1c] border border-[#262626] text-[#999999] hover:text-white flex items-center justify-center transition active:scale-95"
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>

        {/* Reset Button (Charcoal Pill) */}
        <button
          onClick={onReset}
          className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#1c1c1c] hover:bg-[#262626] border border-[#262626] text-white text-xs font-medium tracking-body transition active:scale-95"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Làm lại</span>
        </button>

        {/* Primary CTA (White Pill per DESIGN.md button-primary) */}
        <button
          onClick={onStart}
          disabled={!isReady || isRunning}
          className={`flex items-center gap-1.5 px-4 py-1 rounded-full text-xs font-semibold tracking-body transition-all ${
            !isReady || isRunning
              ? 'bg-[#262626] text-[#666666] cursor-not-allowed'
              : 'bg-white text-black hover:bg-neutral-200 active:scale-95 shadow-md shadow-white/10'
          }`}
        >
          <Play className={`w-3 h-3 ${isRunning ? 'animate-spin' : ''}`} />
          <span>{isRunning ? 'Đang chạy' : 'Bắt Đầu'}</span>
        </button>
      </div>
    </nav>
  );
};
