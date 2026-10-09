'use client';

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Season, ProductItem } from '@/types';

interface SeasonBinData {
  key: Season;
  name: string;
  subName: string;
  icon: string;
  count: number;
  items: ProductItem[];
  gradientText: string;
}

interface SeasonBinsProps {
  springItems: ProductItem[];
  summerItems: ProductItem[];
  autumnItems: ProductItem[];
  winterItems: ProductItem[];
  impactingSeason: Season | null;
}

export const SeasonBins: React.FC<SeasonBinsProps> = ({
  springItems,
  summerItems,
  autumnItems,
  winterItems,
  impactingSeason,
}) => {
  const bins: SeasonBinData[] = [
    {
      key: 'SPRING',
      name: 'XUÂN',
      subName: 'MÙA XUÂN',
      icon: '🌸',
      count: springItems.length,
      items: springItems,
      gradientText: 'from-[#d44df0] to-[#ff5577]',
    },
    {
      key: 'SUMMER',
      name: 'HẠ',
      subName: 'MÙA HẠ',
      icon: '☀️',
      count: summerItems.length,
      items: summerItems,
      gradientText: 'from-[#ff7a3d] to-[#ffa44a]',
    },
    {
      key: 'AUTUMN',
      name: 'THU',
      subName: 'MÙA THU',
      icon: '🍂',
      count: autumnItems.length,
      items: autumnItems,
      gradientText: 'from-[#6a4cf5] to-[#9d7cf7]',
    },
    {
      key: 'WINTER',
      name: 'ĐÔNG',
      subName: 'MÙA ĐÔNG',
      icon: '❄️',
      count: winterItems.length,
      items: winterItems,
      gradientText: 'from-[#0099ff] to-[#60c5ff]',
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-1 select-none">
      <div className="grid grid-cols-4 gap-2.5">
        {bins.map((bin) => {
          const isImpacting = impactingSeason === bin.key;

          return (
            <motion.div
              key={bin.key}
              id={`bin-${bin.key.toLowerCase()}`}
              animate={
                isImpacting
                  ? {
                      scale: [1, 1.04, 0.98, 1],
                      borderColor: ['#262626', '#ffffff', '#262626'],
                      backgroundColor: ['#141414', '#1c1c1c', '#141414'],
                    }
                  : {}
              }
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="relative rounded-2xl border border-[#262626] bg-[#141414] p-2.5 flex flex-col justify-between h-[96px] sm:h-[102px] shadow-lg overflow-hidden"
            >
              {/* Hiệu ứng Floating +1 tại ô mùa khi nhận sản phẩm */}
              <AnimatePresence>
                {isImpacting && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.6 }}
                    animate={{ opacity: 1, y: -22, scale: 1.3 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="absolute -top-1 left-1/2 -translate-x-1/2 z-30 font-black text-sm font-mono text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] pointer-events-none"
                  >
                    +1
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Header của Ô Mùa: Tên + Counter lớn */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg sm:text-xl">{bin.icon}</span>
                  <div>
                    <h4 className="font-semibold text-xs tracking-headline text-white flex items-center gap-1">
                      {bin.name}
                      <span className="text-[9px] font-mono text-[#666666] hidden sm:inline">
                        ({bin.subName})
                      </span>
                    </h4>
                  </div>
                </div>

                {/* Counter lớn với typography negative tracking */}
                <motion.div
                  key={bin.count}
                  initial={{ scale: 1.25 }}
                  animate={{ scale: 1 }}
                  className={`font-mono text-xl sm:text-2xl font-black tracking-display bg-gradient-to-r ${bin.gradientText} bg-clip-text text-transparent`}
                >
                  {bin.count}
                </motion.div>
              </div>

              {/* Khay thumbnail nhỏ gọn */}
              <div className="mt-1 pt-1 border-t border-[#1a1a1a]">
                {bin.items.length === 0 ? (
                  <div className="h-6 rounded bg-[#090909]/60 border border-[#262626] flex items-center justify-center text-[10px] text-[#555555] font-mono">
                    0 món
                  </div>
                ) : (
                  <div className="flex items-center gap-1 overflow-hidden py-0.5">
                    {bin.items.slice(-4).map((item, idx) => (
                      <div
                        key={`${item.id}-${idx}`}
                        title={item.name}
                        className="relative w-6 h-6 rounded-md overflow-hidden shrink-0 border border-[#262626] bg-[#090909]"
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="24px"
                          className="object-cover"
                        />
                      </div>
                    ))}
                    {bin.items.length > 4 && (
                      <span className="text-[9px] font-mono text-[#888888] pl-0.5">
                        +{bin.items.length - 4}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
