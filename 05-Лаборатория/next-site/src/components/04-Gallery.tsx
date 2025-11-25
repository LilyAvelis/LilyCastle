'use client';

import { useCategories } from '@/hooks/useCategories';
import GalleryCard from './04-GalleryCard';

export default function Gallery() {
  const { categories, loading, error } = useCategories();

  if (loading) {
    return (
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-stone-800 mb-12 text-center">
          Популярные композиции
        </h2>
        <div className="flex items-center justify-center py-20">
          <div className="text-stone-400">Загрузка...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center text-rose-600">
          Ошибка загрузки категорий. Проверьте подключение к Firebase.
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <h2 className="text-4xl font-bold text-stone-800 mb-12 text-center">
        Популярные композиции
      </h2>

      {/* Grid на 2-3 колонки */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <GalleryCard key={category.id} category={category} />
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center text-stone-400 py-20">
          Категории пока не добавлены
        </div>
      )}
    </section>
  );
}
