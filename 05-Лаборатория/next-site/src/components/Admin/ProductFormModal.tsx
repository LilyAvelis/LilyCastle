'use client';

import { useState, useEffect } from 'react';
import { Category, Product } from '@/types';
import { addProduct, updateProduct, deleteProduct } from '@/lib/firestore-actions';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
  categories: Category[];
}

export default function ProductFormModal({ isOpen, onClose, productToEdit, categories }: ProductFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    imageUrl: '',
    inStock: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Заполняем форму при редактировании
  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name,
        description: productToEdit.description,
        price: productToEdit.price.toString(),
        categoryId: productToEdit.categoryId,
        imageUrl: productToEdit.imageUrl,
        inStock: productToEdit.inStock,
      });
    } else {
      // Сброс для нового товара
      setFormData({
        name: '',
        description: '',
        price: '',
        categoryId: categories[0]?.id || '',
        imageUrl: '',
        inStock: true,
      });
    }
    setImageFile(null);
  }, [productToEdit, categories, isOpen]);

  // Блокировка скролла и Esc
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        categoryId: formData.categoryId,
        imageUrl: formData.imageUrl || '', // Гарантируем строку
        inStock: formData.inStock,
        order: productToEdit?.order || 999,
      };

      if (productToEdit) {
        await updateProduct(productToEdit.id, productData, imageFile || undefined);
      } else {
        await addProduct(productData, imageFile || undefined);
      }
      
      onClose();
    } catch (error) {
      console.error(error);
      alert('Ошибка: ' + ((error as Error).message || 'Неизвестная ошибка'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!productToEdit || !confirm('Вы уверены, что хотите удалить этот товар?')) return;
    
    setLoading(true);
    try {
      await deleteProduct(productToEdit.id);
      onClose();
    } catch (error) {
      alert('Ошибка удаления: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] mx-4 md:mx-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 md:p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
          <h2 className="text-lg md:text-xl font-bold text-stone-800">
            {productToEdit ? '✏️ Редактировать товар' : '✨ Новый товар'}
          </h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 p-2">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 overflow-y-auto flex-grow space-y-4">
          {/* Категория */}
          <div>
            <label className="block text-sm font-bold text-black mb-1">Категория</label>
            <select
              required
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full p-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-500 outline-none text-black bg-white"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} className="text-black">
                  {cat.emoji} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Название */}
          <div>
            <label className="block text-sm font-bold text-black mb-1">Название</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-500 outline-none text-black placeholder:text-stone-400"
              placeholder="Например: Клубничный взрыв"
            />
          </div>

          {/* Описание */}
          <div>
            <label className="block text-sm font-bold text-black mb-1">Описание</label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-500 outline-none text-black placeholder:text-stone-400"
              placeholder="Состав букета..."
            />
          </div>

          {/* Цена */}
          <div>
            <label className="block text-sm font-bold text-black mb-1">Цена (₽)</label>
            <input
              type="number"
              required
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full p-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-500 outline-none text-black"
            />
          </div>

          {/* Картинка */}
          <div>
            <label className="block text-sm font-medium text-stone-900 mb-1">Картинка (необязательно)</label>
            <div className="space-y-2">
              {/* Вариант 2: Файл */}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setImageFile(e.target.files[0]);
                  }
                }}
                className="w-full text-sm text-stone-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100"
              />
              <div className="text-center text-stone-400 text-xs">- ИЛИ ССЫЛКА -</div>
              {/* Вариант 1: Ссылка */}
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full p-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-500 outline-none text-sm text-black placeholder:text-stone-400"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Наличие */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="inStock"
              checked={formData.inStock}
              onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
              className="w-5 h-5 text-rose-500 rounded focus:ring-rose-500"
            />
            <label htmlFor="inStock" className="text-stone-700">В наличии</label>
          </div>
        </form>

        <div className="p-4 md:p-6 border-t border-stone-100 bg-stone-50 flex flex-col-reverse md:flex-row justify-between gap-3">
          {productToEdit && (
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 rounded-lg text-rose-500 hover:bg-rose-50 transition font-medium w-full md:w-auto text-center"
              disabled={loading}
            >
              Удалить
            </button>
          )}
          <div className="flex gap-3 ml-auto w-full md:w-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-stone-600 hover:bg-stone-200 transition flex-1 md:flex-none"
              disabled={loading}
            >
              Отмена
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 rounded-lg bg-rose-400 text-white font-medium hover:bg-rose-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 flex-1 md:flex-none"
            >
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
