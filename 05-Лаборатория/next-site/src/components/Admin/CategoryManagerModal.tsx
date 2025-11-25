'use client';

import { useState, useEffect } from 'react';
import { Category } from '@/types';
import { 
  addCategory, 
  deleteCategory, 
  reorderCategories, 
  getUndefinedProductsCount, 
  clearUndefinedProducts 
} from '@/lib/firestore-actions';
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
}

// Компонент сортируемого элемента
function SortableItem({ category, onDelete }: { category: Category; onDelete: (id: string, name: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`flex items-center gap-3 p-3 bg-stone-50 rounded-xl border ${isDragging ? 'border-rose-400 shadow-lg' : 'border-stone-200'}`}
    >
      {/* Drag Handle */}
      <div 
        {...attributes} 
        {...listeners} 
        className="cursor-grab active:cursor-grabbing p-2 text-stone-400 hover:text-stone-600 touch-none"
      >
        ⠿
      </div>
      
      <div className="w-12 h-12 flex items-center justify-center bg-white rounded-lg text-2xl border border-stone-100 select-none">
        {category.emoji}
      </div>
      
      <div className="flex-grow select-none">
        <h3 className="font-bold text-black">{category.name}</h3>
        <p className="text-xs text-stone-500 truncate">{category.description}</p>
      </div>
      
      <button 
        onClick={() => onDelete(category.id, category.name)}
        className="p-2 text-stone-400 hover:text-rose-500 transition"
        title="Удалить"
      >
        🗑️
      </button>
    </div>
  );
}

export default function CategoryManagerModal({ isOpen, onClose, categories: initialCategories }: CategoryManagerModalProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [undefinedCount, setUndefinedCount] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', emoji: '', description: '' });
  const [loading, setLoading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Начинать драг только после сдвига на 5px (чтобы клики работали)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  useEffect(() => {
    if (isOpen) {
      checkUndefined();
      // Блокируем скролл
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // Закрытие по Esc
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const checkUndefined = async () => {
    const count = await getUndefinedProductsCount();
    setUndefinedCount(count);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setCategories((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSaveOrder = async () => {
    setLoading(true);
    try {
      await reorderCategories(categories);
      alert('Порядок сохранен!');
    } catch (error) {
      alert('Ошибка: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newCategory.name || !newCategory.emoji) return;
    setLoading(true);
    try {
      await addCategory({
        ...newCategory,
        order: categories.length, 
      });
      setIsAdding(false);
      setNewCategory({ name: '', emoji: '', description: '' });
    } catch (error) {
      alert('Ошибка: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Удалить категорию "${name}"? Товары переместятся в "Неопределенные".`)) return;
    setLoading(true);
    try {
      await deleteCategory(id);
      await checkUndefined();
    } catch (error) {
      alert('Ошибка: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearUndefined = async () => {
    if (!confirm(`Удалить навсегда ${undefinedCount} товаров из "Неопределенных"?`)) return;
    setLoading(true);
    try {
      await clearUndefinedProducts();
      setUndefinedCount(0);
      alert('Очищено!');
    } catch (error) {
      alert('Ошибка: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
          <h2 className="text-xl font-bold text-black">📂 Управление категориями</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-black">✕</button>
        </div>

        <div className="p-6 overflow-y-auto flex-grow">
          {/* Список категорий (Drag & Drop) */}
          <div className="space-y-3 mb-8">
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={categories.map(c => c.id)}
                strategy={verticalListSortingStrategy}
              >
                {categories.map((cat) => (
                  <SortableItem 
                    key={cat.id} 
                    category={cat} 
                    onDelete={handleDelete} 
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>

          {/* Кнопка сохранения порядка */}
          {JSON.stringify(categories.map(c => c.id)) !== JSON.stringify(initialCategories.map(c => c.id)) && (
            <button 
              onClick={handleSaveOrder}
              disabled={loading}
              className="w-full py-3 mb-8 bg-stone-800 text-white rounded-xl font-bold hover:bg-black transition"
            >
              💾 Сохранить новый порядок
            </button>
          )}

          {/* Добавление новой */}
          {isAdding ? (
            <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 animate-in fade-in slide-in-from-bottom-2">
              <h3 className="font-bold text-rose-700 mb-3">Новая категория</h3>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <input 
                    placeholder="Эмодзи (🍓)" 
                    className="w-20 p-2 rounded-lg border border-rose-200 outline-none focus:ring-2 focus:ring-rose-400 text-center text-2xl"
                    value={newCategory.emoji}
                    onChange={e => setNewCategory({...newCategory, emoji: e.target.value})}
                  />
                  <input 
                    placeholder="Название" 
                    className="flex-grow p-2 rounded-lg border border-rose-200 outline-none focus:ring-2 focus:ring-rose-400 font-bold text-black"
                    value={newCategory.name}
                    onChange={e => setNewCategory({...newCategory, name: e.target.value})}
                  />
                </div>
                <input 
                  placeholder="Описание" 
                  className="w-full p-2 rounded-lg border border-rose-200 outline-none focus:ring-2 focus:ring-rose-400 text-sm text-black"
                  value={newCategory.description}
                  onChange={e => setNewCategory({...newCategory, description: e.target.value})}
                />
                <div className="flex gap-2">
                  <button onClick={() => setIsAdding(false)} className="flex-1 py-2 bg-white text-stone-500 rounded-lg border border-stone-200 hover:bg-stone-50">Отмена</button>
                  <button onClick={handleAdd} className="flex-1 py-2 bg-rose-500 text-white rounded-lg font-bold hover:bg-rose-600">Создать</button>
                </div>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setIsAdding(true)}
              className="w-full py-4 border-2 border-dashed border-stone-300 rounded-xl text-stone-400 font-bold hover:border-rose-400 hover:text-rose-500 transition flex items-center justify-center gap-2"
            >
              <span className="text-2xl">➕</span> Добавить категорию
            </button>
          )}

          {/* Неопределенные товары */}
          {undefinedCount > 0 && (
            <div className="mt-8 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-center justify-between">
              <div>
                <h3 className="font-bold text-orange-800">⚠️ Неопределенные товары: {undefinedCount}</h3>
                <p className="text-xs text-orange-600">Товары без категории (корзина)</p>
              </div>
              <button 
                onClick={handleClearUndefined}
                className="px-4 py-2 bg-orange-200 text-orange-800 rounded-lg font-bold hover:bg-orange-300 text-sm"
              >
                Очистить всё
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
