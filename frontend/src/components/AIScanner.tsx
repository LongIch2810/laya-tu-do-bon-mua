'use client';

import React from 'react';
import { Scan, Sparkles } from 'lucide-react';
import { SorterState } from '@/types';

interface AIScannerProps {
  sorterState: SorterState;
}

export const AIScanner: React.FC<AIScannerProps> = ({ sorterState }) => {
  const isScanning = sorterState === 'scanning';
  const hasResult = sorterState === 'result' || sorterState === 'transferring';

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      {/* Khung Scanner tối giản theo chuẩn Framer Artboard */}
      <div
        className={`w-[315px] sm:w-[340px] h-[355px] sm:h-[375px] rounded-3xl border transition-all duration-400 relative flex flex-col justify-between p-2.5 ${
          isScanning
            ? 'border-[#0099ff] shadow-[0_0_40px_rgba(0,153,255,0.25)] bg-[#141414]/30'
            : hasResult
            ? 'border-white/40 shadow-[0_0_30px_rgba(255,255,255,0.15)] bg-[#141414]/20'
            : 'border-[#262626] bg-[#090909]/60'
        }`}
      >
        {/* 4 Góc Laser Brackets mảnh */}
        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[#0099ff] rounded-tl-sm" />
        <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-[#0099ff] rounded-tr-sm" />
        <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-[#0099ff] rounded-bl-sm" />
        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[#0099ff] rounded-br-sm" />

        {/* HUD Bar phía trên Scanner */}
        <div className="flex items-center justify-between text-[10px] font-mono tracking-widest px-2.5 py-1 bg-[#141414]/90 rounded-full border border-[#262626] z-20">
          <div className="flex items-center gap-1.5 text-white">
            <Scan className={`w-3 h-3 text-[#0099ff] ${isScanning ? 'animate-spin' : ''}`} />
            <span className="font-semibold">BỘ QUÉT AI</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isScanning
                  ? 'bg-[#0099ff] animate-ping'
                  : hasResult
                  ? 'bg-white'
                  : 'bg-[#666666]'
              }`}
            />
            <span
              className={`${
                isScanning
                  ? 'text-[#0099ff] font-semibold'
                  : hasResult
                  ? 'text-white'
                  : 'text-[#666666]'
              }`}
            >
              {isScanning ? 'ĐANG PHÂN TÍCH...' : hasResult ? 'ĐÃ PHÂN LOẠI' : 'CHỜ QUÉT'}
            </span>
          </div>
        </div>

        {/* Tia quét Laser Beam chuyển động lên xuống khi scanning */}
        {isScanning && (
          <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-[#0099ff] to-transparent shadow-[0_0_12px_#0099ff] animate-laser z-20 pointer-events-none">
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.2 rounded-full bg-[#141414] text-[#0099ff] text-[8px] font-mono border border-[#0099ff]/50">
              ĐANG QUÉT VẢI
            </div>
          </div>
        )}

        {/* HUD Bar phía dưới Scanner */}
        <div className="flex items-center justify-between text-[9px] font-mono text-[#888888] px-2.5 py-1 bg-[#141414]/90 rounded-full border border-[#262626] z-20">
          <span>PHÂN LOẠI AI</span>
          <div className="flex items-center gap-1 text-white">
            <Sparkles className="w-2.5 h-2.5 text-[#0099ff]" />
            <span>MÔ HÌNH LAYA</span>
          </div>
        </div>
      </div>
    </div>
  );
};
