'use client';

import { Category } from '@/types';
import { useProductsByCategory } from '@/hooks/useProducts';
import Image from 'next/image';
import Link from 'next/link';

interface GalleryCardProps {
  category: Category;
}

export default function GalleryCard({ category }: GalleryCardProps) {
  const { products } = useProductsByCategory(category.id);

  return (
    <Link href="/catalog" className="block">
      <div className="group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-500">
        {/* Область с картинкой */}
        <div className="relative h-64 w-full overflow-hidden bg-gradient-to-br from-rose-400 via-pink-300 to-orange-300">
          
          {/* Слой 1: Приоритет обложки, эмодзи только если нет обложки */}
          <div className="absolute inset-0 flex items-center justify-center transition-all duration-700 ease-in-out group-hover:opacity-0 group-hover:scale-110 group-hover:blur-md">
            {category.imageUrl ? (
              <Image
                src={category.imageUrl}
                alt={category.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="text-8xl select-none">{category.emoji}</div>
            )}
          </div>

          {/* Слой 2: Карусель (Появляется при наведении) */}
          {products.length > 0 && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-700 ease-in-out">
              <div className="animate-scroll flex">
                {/* Оригиналы */}
                {products.map((product, index) => (
                  <div key={product.id} className="flex-shrink-0 w-64 h-64 relative">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-8xl bg-gradient-to-br from-rose-400 via-pink-300 to-orange-300">
                        {category.emoji}
                        <div className="text-2xl font-bold text-white mt-4">#{index + 1}</div>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <p className="text-white font-semibold text-sm">{product.name}</p>
                      <p className="text-rose-400 text-xs">₽{product.price}</p>
                    </div>
                  </div>
                ))}
                {/* Дубликаты для бесшовности */}
                {products.map((product, index) => (
                  <div key={`dup-${product.id}`} className="flex-shrink-0 w-64 h-64 relative">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-8xl bg-gradient-to-br from-rose-400 via-pink-300 to-orange-300">
                        {category.emoji}
                        <div className="text-2xl font-bold text-white mt-4">#{index + 1}</div>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <p className="text-white font-semibold text-sm">{product.name}</p>
                      <p className="text-rose-400 text-xs">₽{product.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Название и описание внизу */}
        <div className="p-6 relative z-10 bg-white">
          <h3 className="text-xl font-bold text-stone-800 mb-2 group-hover:text-rose-500 transition-colors">
            {category.name}
          </h3>
          <p className="text-stone-600 text-sm">{category.description}</p>
        </div>
      </div>
    </Link>
  );
}