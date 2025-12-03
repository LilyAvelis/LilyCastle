'use client';

import { useState, useEffect, useRef } from 'react';
import { Category } from '@/types';
import { 
  addCategory, 
  deleteCategory, 
  updateCategory,
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
import Image from 'next/image';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
}

// Компонент сортируемого элемента
function SortableItem({ 
  category, 
  onDelete,
  onEdit 
}: { 
  category: Category; 
  onDelete: (id: string, name: string) => void;
  onEdit: (category: Category) => void;
}) {
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
      className={`flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-stone-50 rounded-xl border ${isDragging ? 'border-rose-400 shadow-lg' : 'border-stone-200'}`}
    >
      {/* Drag Handle */}
      <div 
        {...attributes} 
        {...listeners} 
        className="cursor-grab active:cursor-grabbing p-2 text-stone-400 hover:text-stone-600 touch-none flex-shrink-0"
      >
        ⠿
      </div>
      
      {/* Обложка или эмодзи */}
      <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white rounded-lg text-xl md:text-2xl border border-stone-100 select-none flex-shrink-0 overflow-hidden relative">
        {category.imageUrl ? (
          <Image
            src={category.imageUrl}
            alt={category.name}
            fill
            className="object-cover"
          />
        ) : (
          category.emoji
        )}
      </div>
      
      <div className="flex-grow select-none min-w-0">
        <h3 className="font-bold text-black truncate">{category.name}</h3>
        <p className="text-xs text-stone-500 truncate">{category.description}</p>
      </div>
      
      {/* Кнопка редактирования */}
      <button 
        onClick={() => onEdit(category)}
        className="p-2 text-stone-400 hover:text-blue-500 transition flex-shrink-0"
        title="Редактировать"
      >
        ✏️
      </button>
      
      <button 
        onClick={() => onDelete(category.id, category.name)}
        className="p-2 text-stone-400 hover:text-rose-500 transition flex-shrink-0"
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
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState({ name: '', emoji: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsAdding(false);
    setEditImageFile(null);
    setEditImagePreview(category.imageUrl || null);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setEditImageFile(null);
    setEditImagePreview(null);
    if (editingCategory) {
      setEditingCategory({ ...editingCategory, imageUrl: undefined });
    }
  };

  const handleSaveEdit = async () => {
    if (!editingCategory || !editingCategory.name || !editingCategory.emoji) return;
    setLoading(true);
    try {
      await updateCategory(editingCategory.id, {
        name: editingCategory.name,
        emoji: editingCategory.emoji,
        description: editingCategory.description,
        imageUrl: editImagePreview === null ? '' : editingCategory.imageUrl,
      }, editImageFile || undefined);
      setEditingCategory(null);
      setEditImageFile(null);
      setEditImagePreview(null);
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] mx-4 md:mx-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 md:p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
          <h2 className="text-lg md:text-xl font-bold text-black">📂 Управление категориями</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-black p-2">✕</button>
        </div>

        <div className="p-4 md:p-6 overflow-y-auto flex-grow">
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
                    onEdit={handleEdit}
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
                <div className="flex flex-col-reverse md:flex-row gap-2">
                  <button onClick={() => setIsAdding(false)} className="flex-1 py-3 md:py-2 bg-white text-stone-500 rounded-lg border border-stone-200 hover:bg-stone-50">Отмена</button>
                  <button onClick={handleAdd} className="flex-1 py-3 md:py-2 bg-rose-500 text-white rounded-lg font-bold hover:bg-rose-600">Создать</button>
                </div>
              </div>
            </div>
          ) : editingCategory ? (
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 animate-in fade-in slide-in-from-bottom-2">
              <h3 className="font-bold text-blue-700 mb-3">✏️ Редактирование категории</h3>
              <div className="space-y-3">
                {/* Загрузка обложки */}
                <div className="flex items-center gap-4">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 rounded-xl border-2 border-dashed border-blue-300 flex items-center justify-center cursor-pointer hover:border-blue-500 transition overflow-hidden relative bg-white"
                  >
                    {editImagePreview ? (
                      <Image
                        src={editImagePreview}
                        alt="Обложка"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-3xl text-blue-300">📷</span>
                    )}
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm text-blue-700 font-medium mb-1">Обложка категории</p>
                    <p className="text-xs text-blue-500 mb-2">Необязательно. Если нет — будет эмодзи</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs px-3 py-1 bg-blue-200 text-blue-700 rounded-lg hover:bg-blue-300"
                      >
                        {editImagePreview ? 'Заменить' : 'Загрузить'}
                      </button>
                      {editImagePreview && (
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="text-xs px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                        >
                          Удалить
                        </button>
                      )}
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </div>

                <div className="flex gap-3">
                  <input 
                    placeholder="Эмодзи (🍓)" 
                    className="w-20 p-2 rounded-lg border border-blue-200 outline-none focus:ring-2 focus:ring-blue-400 text-center text-2xl"
                    value={editingCategory.emoji}
                    onChange={e => setEditingCategory({...editingCategory, emoji: e.target.value})}
                  />
                  <input 
                    placeholder="Название" 
                    className="flex-grow p-2 rounded-lg border border-blue-200 outline-none focus:ring-2 focus:ring-blue-400 font-bold text-black"
                    value={editingCategory.name}
                    onChange={e => setEditingCategory({...editingCategory, name: e.target.value})}
                  />
                </div>
                <input 
                  placeholder="Описание" 
                  className="w-full p-2 rounded-lg border border-blue-200 outline-none focus:ring-2 focus:ring-blue-400 text-sm text-black"
                  value={editingCategory.description}
                  onChange={e => setEditingCategory({...editingCategory, description: e.target.value})}
                />
                <div className="flex flex-col-reverse md:flex-row gap-2">
                  <button onClick={() => { setEditingCategory(null); setEditImageFile(null); setEditImagePreview(null); }} className="flex-1 py-3 md:py-2 bg-white text-stone-500 rounded-lg border border-stone-200 hover:bg-stone-50">Отмена</button>
                  <button onClick={handleSaveEdit} disabled={loading} className="flex-1 py-3 md:py-2 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 disabled:opacity-50">
                    {loading ? 'Сохраняем...' : 'Сохранить'}
                  </button>
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
            <div className="mt-8 p-4 bg-orange-50 border border-orange-200 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0">
              <div>
                <h3 className="font-bold text-orange-800">⚠️ Неопределенные товары: {undefinedCount}</h3>
                <p className="text-xs text-orange-600">Товары без категории (корзина)</p>
              </div>
              <button 
                onClick={handleClearUndefined}
                className="w-full md:w-auto px-4 py-3 md:py-2 bg-orange-200 text-orange-800 rounded-lg font-bold hover:bg-orange-300 text-sm"
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
