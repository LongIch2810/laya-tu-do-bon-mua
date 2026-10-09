'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ControlHUD } from '@/components/ControlHUD';
import { ProductCard } from '@/components/ProductCard';
import { AIScanner } from '@/components/AIScanner';
import { FloatingCombatText } from '@/components/FloatingCombatText';
import { SeasonBins } from '@/components/SeasonBins';
import { CompletionModal } from '@/components/CompletionModal';

import { PRODUCTS } from '@/data/products';
import { ProductItem, Season, ClassificationResult, SorterState } from '@/types';
import { checkBackendHealth, classifyProductApi, HealthStatus } from '@/lib/api';
import {
  isSoundMuted,
  toggleSoundMute,
  playDropSound,
  playScanSound,
  playCriticalImpactSound,
  playBinCollectSound,
} from '@/lib/sound';

export default function SeasonSorterPage() {
  const [health, setHealth] = useState<HealthStatus>({ status: 'loading' });

  // State Machine cho Dây chuyền
  const [sorterState, setSorterState] = useState<SorterState>('idle');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [currentResult, setCurrentResult] = useState<ClassificationResult | null>(null);
  const [elapsedScanSec, setElapsedScanSec] = useState<number>(0);

  // 4 Ô Mùa
  const [springItems, setSpringItems] = useState<ProductItem[]>([]);
  const [summerItems, setSummerItems] = useState<ProductItem[]>([]);
  const [autumnItems, setAutumnItems] = useState<ProductItem[]>([]);
  const [winterItems, setWinterItems] = useState<ProductItem[]>([]);

  // Hiệu ứng rung chấn tại ô mùa nhận điểm
  const [impactingSeason, setImpactingSeason] = useState<Season | null>(null);

  // Tổng thời gian inference đo thực tế từ model (ms)
  const [totalInferenceMs, setTotalInferenceMs] = useState<number>(0);

  // Âm thanh
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Refs điều khiển luồng và hủy an toàn
  const abortControllerRef = useRef<AbortController | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRunningRef = useRef<boolean>(false);

  // 1. Polling kiểm tra trạng thái Laya backend
  useEffect(() => {
    const muteFrame = requestAnimationFrame(() => setIsMuted(isSoundMuted()));

    let isMounted = true;
    const pollHealth = async () => {
      const res = await checkBackendHealth();
      if (isMounted) {
        setHealth(res);
      }
    };

    pollHealth();
    const interval = setInterval(pollHealth, 2000);

    return () => {
      cancelAnimationFrame(muteFrame);
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // 2. Chuyển đổi âm thanh
  const handleToggleMute = () => {
    const nextMuted = toggleSoundMute();
    setIsMuted(nextMuted);
  };

  // 3. Reset toàn bộ trạng thái về 0 và hủy bỏ các timers/request cũ
  const handleReset = useCallback(() => {
    isRunningRef.current = false;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    setSorterState('idle');
    setCurrentIndex(0);
    setCurrentResult(null);
    setElapsedScanSec(0);
    setSpringItems([]);
    setSummerItems([]);
    setAutumnItems([]);
    setWinterItems([]);
    setImpactingSeason(null);
    setTotalInferenceMs(0);
  }, []);

  // 4. Luồng xử lý từng sản phẩm (Free-fall -> Scan -> Impact -> Fly to Bin)
  const processProduct = useCallback(
    async function processProduct(index: number) {
      if (!isRunningRef.current) return;

      if (index >= PRODUCTS.length) {
        setSorterState('completed');
        isRunningRef.current = false;
        return;
      }

      const product = PRODUCTS[index];
      setCurrentIndex(index);
      setCurrentResult(null);
      setElapsedScanSec(0);

      // GIAI ĐOẠN 1: CARD RƠI TỰ DO TỪ TRÊN XUỐNG VỚI GIA TỐC VẬT LÝ
      setSorterState('falling');
      playDropSound();

      // Sau khi rơi 700ms và chạm scanner -> Bắt đầu quét
      timerRef.current = setTimeout(async () => {
        if (!isRunningRef.current) return;

        // GIAI ĐOẠN 2: AI SCANNER & FLOATING PROCESSING TAGS
        setSorterState('scanning');
        playScanSound();

        const scanStart = Date.now();
        scanIntervalRef.current = setInterval(() => {
          setElapsedScanSec((Date.now() - scanStart) / 1000);
        }, 80);

        try {
          abortControllerRef.current = new AbortController();
          const result = await classifyProductApi(
            product,
            abortControllerRef.current.signal
          );

          if (scanIntervalRef.current) {
            clearInterval(scanIntervalRef.current);
            scanIntervalRef.current = null;
          }

          if (!isRunningRef.current) return;

          setCurrentResult(result);
          setTotalInferenceMs((prev) => prev + result.inference_ms);

          // GIAI ĐOẠN 3: CRITICAL HIT IMPACT / FLOATING RESULT
          setSorterState('result');
          playCriticalImpactSound();

          // Dừng 1.35s để người dùng chiêm ngưỡng kết quả +1 MÙA, confidence %, inference ms
          timerRef.current = setTimeout(() => {
            if (!isRunningRef.current) return;

            // GIAI ĐOẠN 4: PRODUCT CARD BAY VỀ ĐÚNG Ô MÙA
            setSorterState('transferring');

            // Thời gian bay về ô mùa: 600ms
            timerRef.current = setTimeout(() => {
              if (!isRunningRef.current) return;

              // GIAI ĐOẠN 5: Ô MÙA RUNG CHẤN (BIN IMPACT) + COUNTER +1
              setSorterState('bin_impact');
              setImpactingSeason(result.season);
              playBinCollectSound();

              // Bỏ sản phẩm vào ô mùa tương ứng
              if (result.season === 'SPRING') {
                setSpringItems((prev) => [...prev, product]);
              } else if (result.season === 'SUMMER') {
                setSummerItems((prev) => [...prev, product]);
              } else if (result.season === 'AUTUMN') {
                setAutumnItems((prev) => [...prev, product]);
              } else {
                setWinterItems((prev) => [...prev, product]);
              }

              // Sau 400ms rung chấn, chuyển tiếp sang sản phẩm tiếp theo
              timerRef.current = setTimeout(() => {
                setImpactingSeason(null);
                if (isRunningRef.current) {
                  processProduct(index + 1);
                }
              }, 400);
            }, 600);
          }, 1350);
        } catch (err: unknown) {
          if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
          if (err instanceof Error && err.name === 'AbortError') return;

          setSorterState('error');
          console.error('Lỗi phân loại:', err);
        }
      }, 700);
    },
    []
  );

  // 5. Bắt đầu Dây chuyền
  const handleStart = () => {
    if (health.status !== 'ready') return;
    handleReset();
    isRunningRef.current = true;
    processProduct(0);
  };

  const currentProduct = PRODUCTS[currentIndex] || PRODUCTS[0];

  // Tính tọa độ bay cong của Card về 4 ô mùa ở chân trang
  const getTransferAnimation = () => {
    if (sorterState !== 'transferring') return {};

    switch (currentResult?.season) {
      case 'SPRING':
        return { x: -320, y: 240, scale: 0.12, opacity: 0 };
      case 'SUMMER':
        return { x: -105, y: 240, scale: 0.12, opacity: 0 };
      case 'AUTUMN':
        return { x: 105, y: 240, scale: 0.12, opacity: 0 };
      case 'WINTER':
      default:
        return { x: 320, y: 240, scale: 0.12, opacity: 0 };
    }
  };

  return (
    <main className="h-screen max-h-screen w-screen overflow-hidden flex flex-col justify-between p-2.5 sm:p-4 bg-[#090909] text-white select-none">
      {/* 1. Control HUD Tối Giản Ở Đỉnh Màn Hình (Không Dùng Header Lớn) */}
      <ControlHUD
        health={health}
        sorterState={sorterState}
        currentIndex={
          sorterState === 'completed'
            ? PRODUCTS.length
            : sorterState === 'idle'
            ? 0
            : currentIndex + 1
        }
        totalProducts={PRODUCTS.length}
        totalInferenceMs={totalInferenceMs}
        isMuted={isMuted}
        onStart={handleStart}
        onReset={handleReset}
        onToggleMute={handleToggleMute}
      />

      {/* 2. Trung Tâm Rơi Tự Do & AI Scanner Arena (Gói gọn, không tràn) */}
      <section className="flex-1 flex flex-col items-center justify-center relative min-h-0 overflow-hidden my-auto py-1">
        <div className="relative w-[315px] sm:w-[340px] h-[355px] sm:h-[375px] flex items-center justify-center">
          {/* Scanner Device Frame */}
          <AIScanner sorterState={sorterState} />

          {/* Floating Combat Text Layer */}
          <FloatingCombatText
            key={sorterState}
            mode={
              sorterState === 'scanning'
                ? 'processing'
                : sorterState === 'result'
                ? 'success'
                : sorterState === 'error'
                ? 'error'
                : 'idle'
            }
            result={currentResult}
            elapsedSeconds={elapsedScanSec}
          />

          {/* Product Card với hiệu ứng Free-Fall từ trên xuống & Transfer */}
          <AnimatePresence mode="wait">
            {sorterState !== 'idle' &&
              sorterState !== 'completed' &&
              sorterState !== 'bin_impact' && (
                <motion.div
                  key={`card-${currentIndex}`}
                  initial={{
                    y: -420, // Xuất hiện từ phía trên vùng hiển thị
                    rotate: -2,
                    scale: 0.95,
                    opacity: 0,
                  }}
                  animate={
                    sorterState === 'transferring'
                      ? getTransferAnimation()
                      : {
                          y: 0, // Dừng chuẩn tại tâm Scanner
                          rotate: 0,
                          scale: 1,
                          opacity: 1,
                        }
                  }
                  exit={{ opacity: 0, scale: 0.2 }}
                  transition={
                    sorterState === 'transferring'
                      ? { duration: 0.6, ease: [0.32, 0, 0.67, 0] }
                      : {
                          type: 'spring',
                          stiffness: 150,
                          damping: 14,
                          mass: 1.1, // Cảm giác trọng lực rơi thật
                        }
                  }
                  className="z-10"
                >
                  <ProductCard
                    product={currentProduct}
                    seasonGlow={
                      sorterState === 'result' || sorterState === 'transferring'
                        ? currentResult?.season
                        : null
                    }
                    isScanning={sorterState === 'scanning'}
                  />
                </motion.div>
              )}
          </AnimatePresence>

          {/* Trạng thái Idle ban đầu */}
          {sorterState === 'idle' && (
            <div className="text-center p-5 rounded-2xl bg-[#141414] border border-[#262626] max-w-xs shadow-2xl z-20">
              <div className="w-10 h-10 rounded-full bg-white text-black mx-auto flex items-center justify-center text-lg mb-2.5 font-bold">
                AI
              </div>
              <h3 className="text-sm font-bold text-white tracking-headline mb-1">
            LAYA – TỦ ĐỒ BỐN MÙA
              </h3>
              <p className="text-[11px] text-[#999999] mb-4 leading-relaxed">
                Tự động thả rơi và phân loại 50 trang phục vào 4 mùa với mô hình Laya Multilingual.
              </p>
              <button
                onClick={handleStart}
                disabled={health.status !== 'ready'}
                className="w-full py-2 rounded-full bg-white text-black font-semibold text-xs tracking-body uppercase hover:bg-neutral-200 active:scale-95 transition shadow-lg shadow-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {health.status === 'ready' ? 'BẮT ĐẦU NGAY' : 'CHỜ LAYA SẴN SÀNG...'}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 3. Bốn Ô Mùa Ở Chân Trang (Season Bins - Gọn gàng ~98px height) */}
      <footer className="w-full pb-1">
        <SeasonBins
          springItems={springItems}
          summerItems={summerItems}
          autumnItems={autumnItems}
          winterItems={winterItems}
          impactingSeason={impactingSeason}
        />
      </footer>

      {/* 4. Modal Vinh Danh Sau Khi Hoàn Thành 50 Món */}
      <CompletionModal
        isOpen={sorterState === 'completed'}
        springCount={springItems.length}
        summerCount={summerItems.length}
        autumnCount={autumnItems.length}
        winterCount={winterItems.length}
        totalInferenceMs={totalInferenceMs}
        onReset={handleReset}
      />
    </main>
  );
}
