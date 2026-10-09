'use client';

import React from 'react';
import Image from 'next/image';
import { ProductItem, Season } from '@/types';
import { Tag } from 'lucide-react';

interface ProductCardProps {
  product: ProductItem;
  seasonGlow?: Season | null;
  isScanning?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  seasonGlow,
  isScanning,
}) => {
  // Đường viền và vầng sáng gradient atmosphere theo chuẩn DESIGN.md
  const getGlowStyles = () => {
    if (!seasonGlow) {
      return isScanning
        ? 'border-[#0099ff] shadow-[0_0_25px_rgba(0,153,255,0.25)]'
        : 'border-[#262626] shadow-xl';
    }
    switch (seasonGlow) {
      case 'SPRING':
        return 'border-[#d44df0] shadow-[0_0_30px_rgba(212,77,240,0.35)]';
      case 'SUMMER':
        return 'border-[#ff7a3d] shadow-[0_0_30px_rgba(255,122,61,0.35)]';
      case 'AUTUMN':
        return 'border-[#6a4cf5] shadow-[0_0_30px_rgba(106,76,245,0.35)]';
      case 'WINTER':
        return 'border-[#0099ff] shadow-[0_0_30px_rgba(0,153,255,0.35)]';
    }
  };

  return (
    <div
      className={`w-[290px] sm:w-[315px] h-[330px] sm:h-[350px] rounded-2xl bg-[#141414] border transition-all duration-300 p-3 flex flex-col justify-between relative select-none ${getGlowStyles()}`}
    >
      {/* Header nhỏ: ID & Phân loại */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-[#1c1c1c] text-white border border-[#262626]">
          ID #{product.id.toString().padStart(2, '0')}
        </span>
        <span className="text-[10px] font-mono text-[#999999] px-2 py-0.5 rounded-full bg-[#1c1c1c] border border-[#262626] flex items-center gap-1">
          <Tag className="w-2.5 h-2.5 text-[#0099ff]" />
          {product.category}
        </span>
      </div>

      {/* Ảnh sản phẩm thật sắc nét */}
      <div className="relative w-full h-40 sm:h-44 rounded-xl overflow-hidden bg-[#090909] border border-[#262626] group">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 290px, 315px"
          priority
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Lớp phủ chân ảnh để làm nổi bật tên sản phẩm */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090909]/90 via-transparent to-transparent" />

        <div className="absolute bottom-2 left-2.5 right-2.5">
          <h3 className="text-xs sm:text-sm font-semibold text-white tracking-headline line-clamp-1 drop-shadow">
            {product.name}
          </h3>
        </div>
      </div>

      <p className="text-[11px] text-[#999999] line-clamp-3" title={product.description}>
        {product.description}
      </p>
    </div>
  );
};
