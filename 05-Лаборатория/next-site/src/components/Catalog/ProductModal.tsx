'use client';

import { Product } from '@/types';
import { useEffect } from 'react';
import Image from 'next/image';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
  // Блокируем скролл фона при открытом модальном окне
  useEffect(() => {
    if (product) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [product]);

  // Закрытие по Esc
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!product) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Изображение */}
        <div className="w-full md:w-1/2 h-64 md:h-auto relative bg-stone-100">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">
              🌸
            </div>
          )}
        </div>

        {/* Информация */}
        <div className="w-full md:w-1/2 p-8 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-3xl font-bold text-black">{product.name}</h2>
            <button 
              onClick={onClose}
              className="text-stone-400 hover:text-black transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <p className="text-stone-800 text-lg mb-6 flex-grow font-medium">
            {product.description}
          </p>

          <div className="mt-auto">
            <div className="flex items-center justify-between mb-6">
              <span className={`text-sm font-bold ${product.inStock ? 'text-green-600' : 'text-orange-500'}`}>
                {product.inStock ? 'В наличии' : 'Под заказ'}
              </span>
              <span className="text-3xl font-bold text-rose-600">
                {product.price} ₽
              </span>
            </div>

            <button className="w-full bg-rose-400 text-white py-4 rounded-xl font-bold text-lg hover:bg-rose-500 transition shadow-lg shadow-rose-200">
              Хочу такой букет!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
