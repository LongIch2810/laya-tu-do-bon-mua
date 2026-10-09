'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { PRODUCTS } from '@/data/products';

export default function PreviewContactSheetPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [brandFilter, setBrandFilter] = useState<'all' | 'cotopaxi' | 'tentree'>('all');

  // Thống kê nhãn hiệu
  const brandStats = useMemo(() => {
    let cotopaxi = 0;
    let tentree = 0;
    for (const p of PRODUCTS) {
      if (p.brand === 'Tentree') {
        tentree++;
      } else {
        cotopaxi++;
      }
    }
    return { cotopaxi, tentree, total: PRODUCTS.length };
  }, []);

  // Lọc sản phẩm
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      const matchBrand =
        brandFilter === 'all'
          ? true
          : brandFilter === 'tentree'
          ? p.brand === 'Tentree'
          : p.brand === 'Cotopaxi';

      const q = searchTerm.toLowerCase();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.id.toString() === q;

      return matchBrand && matchSearch;
    });
  }, [searchTerm, brandFilter]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/30">
      {/* Header Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80 px-4 sm:px-8 py-3 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 hover:bg-slate-800 hover:border-cyan-500/50 text-xs font-medium text-slate-200 transition-all group"
            >
              <span className="text-cyan-400 group-hover:-translate-x-0.5 transition-transform">←</span>
              Băng chuyền phân loại
            </Link>
            <div className="h-4 w-px bg-slate-800" />
            <div>
              <h1 className="text-base sm:text-lg font-bold bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent flex items-center gap-2">
                <span>Danh sách sản phẩm từ catalog</span>
                <span className="text-[11px] font-mono font-normal px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-800/60 text-cyan-300">
                  {brandStats.total} sản phẩm
                </span>
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">
                Tên, mô tả và ảnh từ catalog Cotopaxi &amp; Tentree
              </p>
            </div>
          </div>

          {/* Search & Brand Filter Controls */}
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Tìm tên, mô tả, #ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center rounded-lg bg-slate-900 p-0.5 border border-slate-800 text-xs">
              <button
                onClick={() => setBrandFilter('all')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  brandFilter === 'all'
                    ? 'bg-cyan-600 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Tất cả ({brandStats.total})
              </button>
              <button
                onClick={() => setBrandFilter('cotopaxi')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  brandFilter === 'cotopaxi'
                    ? 'bg-amber-600 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Cotopaxi ({brandStats.cotopaxi})
              </button>
              <button
                onClick={() => setBrandFilter('tentree')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  brandFilter === 'tentree'
                    ? 'bg-emerald-600 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Tentree ({brandStats.tentree})
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6">
        {/* KPI / Specs Banner */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-mono">Quy mô bộ dữ liệu</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-cyan-400">{brandStats.total}</span>
              <span className="text-xs text-slate-400">sản phẩm</span>
            </div>
            <span className="text-[10px] text-emerald-400 mt-1">{brandStats.cotopaxi} Cotopaxi · {brandStats.tentree} Tentree</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-mono">Nguồn gốc</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-400">Shopify</span>
              <span className="text-xs text-slate-400">API catalog công khai</span>
            </div>
            <span className="text-[10px] text-amber-300 mt-1">Xem liên kết gốc trên từng sản phẩm</span>
          </div>
        </div>

        {/* Product Grid */}
        <div className="mb-3 flex items-center justify-between text-xs text-slate-400 px-1">
          <span>
            Đang hiển thị <strong className="text-slate-200">{filteredProducts.length}</strong> sản phẩm:
          </span>
          {searchTerm && (
            <span>
              Kết quả cho: &ldquo;<span className="text-cyan-400">{searchTerm}</span>&rdquo;
            </span>
          )}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center rounded-2xl border border-dashed border-slate-800">
            <p className="text-slate-400 text-sm">Không tìm thấy sản phẩm nào khớp với bộ lọc.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setBrandFilter('all');
              }}
              className="mt-3 px-3 py-1.5 text-xs text-cyan-400 hover:underline"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map((p) => {
              const isTentree = p.brand === 'Tentree';
              const brandName = isTentree ? 'Tentree' : 'Cotopaxi';
              const brandColor = isTentree
                ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
                : 'bg-amber-950/80 border-amber-800 text-amber-300';

              return (
                <div
                  key={p.id}
                  className="group relative flex flex-col rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-950/30 transition-all duration-200 overflow-hidden"
                >
                  {/* Image Container with Badges */}
                  <div className="relative aspect-square w-full bg-slate-950 overflow-hidden">
                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* ID Badge */}
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-sm border border-slate-700/80 text-[10px] font-mono font-bold text-slate-200 shadow">
                      #{p.id.toString().padStart(2, '0')}
                    </div>

                    {/* Brand Badge */}
                    <div
                      className={`absolute top-2 right-2 px-2 py-0.5 rounded-md border text-[10px] font-semibold tracking-wide backdrop-blur-sm ${brandColor} shadow`}
                    >
                      {brandName}
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="p-3 flex-1 flex flex-col justify-between gap-2.5">
                    <div>
                      {/* Category Tag */}
                      <span className="inline-block text-[10px] font-medium uppercase tracking-wider text-cyan-400/90 mb-1">
                        {p.category}
                      </span>

                      {/* Product Name */}
                      <h3
                        className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug"
                        title={p.name}
                      >
                        {p.name}
                      </h3>
                    </div>

                    {/* Original catalog description */}
                    <div className="space-y-1.5 text-[11px] border-t border-slate-800/80 pt-2 text-slate-300">
                      <p className="line-clamp-5" title={p.description}>{p.description}</p>
                    </div>

                    {/* Verification & Outbound Links */}
                    <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between gap-2 text-[10px]">
                      {p.sourceUrl && (
                        <a
                          href={p.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 hover:underline truncate"
                          title="Xem trang sản phẩm gốc trên Website"
                        >
                          <span>Website gốc</span>
                          <span className="text-[9px]">↗</span>
                        </a>
                      )}
                      {p.imageSourceUrl && (
                        <a
                          href={p.imageSourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-200 hover:underline truncate"
                          title="Xem file ảnh gốc độ phân giải cao trên CDN"
                        >
                          <span>Ảnh gốc</span>
                          <span className="text-[9px]">↗</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 px-4 text-center text-xs text-slate-500">
        Laya – Tủ Đồ Bốn Mùa • Catalog công khai của Cotopaxi và Tentree
      </footer>
    </div>
  );
}
