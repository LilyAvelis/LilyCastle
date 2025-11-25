'use client';

import { useState } from 'react';
import { Category, Product } from '@/types';
import { useProductsByCategory } from '@/hooks/useProducts';
import { useAdmin } from '@/context/AdminContext';
import Image from 'next/image';

interface CategorySectionProps {
  category: Category;
  onProductClick: (product: Product) => void;
  onEditProduct?: (product: Product) => void;
  isOpenDefault?: boolean;
}

export default function CategorySection({ category, onProductClick, onEditProduct, isOpenDefault = false }: CategorySectionProps) {
  const [isOpen, setIsOpen] = useState(isOpenDefault);
  const { products, loading } = useProductsByCategory(isOpen ? category.id : null);
  const { isAdmin } = useAdmin();

  return (
    <div className="border-b border-stone-200 last:border-0">
      {/* Заголовок-аккордеон */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-8 flex items-center justify-between group text-left"
      >
        <div className="flex items-center gap-4">
          <span className="text-4xl">{category.emoji}</span>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-black group-hover:text-rose-600 transition">
              {category.name}
            </h2>
            <p className="text-stone-700 mt-1 font-medium">{category.description}</p>
          </div>
        </div>
        <div className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <svg className="w-8 h-8 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Сетка товаров */}
      <div 
        className={`grid transition-all duration-500 ease-in-out overflow-hidden ${
          isOpen ? 'grid-rows-[1fr] opacity-100 mb-12' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="min-h-0">
          {loading ? (
            <div className="py-12 text-center text-stone-400">Загружаем букеты...</div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
              {products.map((product) => (
                <div 
                  key={product.id}
                  className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition border border-stone-100"
                >
                  {/* Кнопка редактирования (только для админа) */}
                  {isAdmin && onEditProduct && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditProduct(product);
                      }}
                      className="absolute top-2 right-2 z-20 bg-white/90 hover:bg-rose-500 hover:text-white text-stone-600 p-2 rounded-full shadow-md transition"
                      title="Редактировать"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  )}

                  <div 
                    onClick={() => onProductClick(product)}
                    className="cursor-pointer"
                  >
                    <div className="aspect-square relative bg-stone-50 overflow-hidden">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">
                          {category.emoji}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition duration-300" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-stone-800 mb-1 truncate">{product.name}</h3>
                      <p className="text-rose-500 font-bold">{product.price} ₽</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-stone-400 bg-stone-50 rounded-xl">
              В этой категории пока нет товаров 😔
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
