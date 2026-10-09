'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Trophy, CheckCircle, Zap } from 'lucide-react';

interface CompletionModalProps {
  isOpen: boolean;
  springCount: number;
  summerCount: number;
  autumnCount: number;
  winterCount: number;
  totalInferenceMs: number;
  onReset: () => void;
}

export const CompletionModal: React.FC<CompletionModalProps> = ({
  isOpen,
  springCount,
  summerCount,
  autumnCount,
  winterCount,
  totalInferenceMs,
  onReset,
}) => {
  useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const total = springCount + summerCount + autumnCount + winterCount;
  const avgMs = total > 0 ? (totalInferenceMs / total).toFixed(1) : '0';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090909]/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md rounded-2xl border border-[#262626] bg-[#141414] p-5 text-center shadow-2xl relative select-none"
        >
          {/* Trophy Icon */}
          <div className="mx-auto w-12 h-12 rounded-full bg-white text-black flex items-center justify-center mb-3">
            <Trophy className="w-6 h-6 text-black" />
          </div>

          <h2 className="text-xl font-bold tracking-headline text-white uppercase mb-1">
            HOÀN TẤT 50 SẢN PHẨM
          </h2>
          <p className="text-xs text-[#999999] mb-4">
            Đã phân loại 50 sản phẩm bằng mô hình Laya Multilingual.
          </p>

          {/* 4 Mùa */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="p-2 rounded-xl bg-[#1c1c1c] border border-[#262626]">
              <span className="text-base">🌸</span>
              <div className="text-base font-black font-mono text-[#d44df0]">{springCount}</div>
              <div className="text-[9px] text-[#888888] font-mono">XUÂN</div>
            </div>

            <div className="p-2 rounded-xl bg-[#1c1c1c] border border-[#262626]">
              <span className="text-base">☀️</span>
              <div className="text-base font-black font-mono text-[#ff7a3d]">{summerCount}</div>
              <div className="text-[9px] text-[#888888] font-mono">HẠ</div>
            </div>

            <div className="p-2 rounded-xl bg-[#1c1c1c] border border-[#262626]">
              <span className="text-base">🍂</span>
              <div className="text-base font-black font-mono text-[#6a4cf5]">{autumnCount}</div>
              <div className="text-[9px] text-[#888888] font-mono">THU</div>
            </div>

            <div className="p-2 rounded-xl bg-[#1c1c1c] border border-[#262626]">
              <span className="text-base">❄️</span>
              <div className="text-base font-black font-mono text-[#0099ff]">{winterCount}</div>
              <div className="text-[9px] text-[#888888] font-mono">ĐÔNG</div>
            </div>
          </div>

          {/* Hiệu suất */}
          <div className="rounded-xl bg-[#090909] border border-[#262626] p-2.5 mb-5 text-xs text-[#999999] flex items-center justify-around font-mono">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-[#22c55e]" />
              <span>Tổng: <b className="text-white">{total}/50</b></span>
            </div>
            <div className="w-px h-4 bg-[#262626]" />
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#0099ff]" />
              <span>TB: <b className="text-white">{avgMs}ms</b></span>
            </div>
          </div>

          {/* White Pill CTA (button-primary) */}
          <button
            onClick={onReset}
            className="w-full py-2.5 rounded-full bg-white text-black font-semibold text-xs tracking-body uppercase hover:bg-neutral-200 active:scale-95 transition flex items-center justify-center gap-1.5 shadow-md shadow-white/10"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Chạy Lại Từ Đầu</span>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
