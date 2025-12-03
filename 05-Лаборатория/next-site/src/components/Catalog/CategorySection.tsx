'use client';

import { useState, useEffect } from 'react';
import { Category, Product } from '@/types';
import { useProductsByCategory } from '@/hooks/useProducts';
import { useAdmin } from '@/context/AdminContext';
import { useCart } from '@/context/CartContext';
import { reorderProducts } from '@/lib/firestore-actions';
import Image from 'next/image';
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
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface CategorySectionProps {
  category: Category;
  onProductClick: (product: Product) => void;
  onEditProduct?: (product: Product) => void;
  isOpenDefault?: boolean;
}

// Sortable Product Card
function SortableProductCard({ 
  product, 
  category, 
  isAdmin, 
  onProductClick, 
  onEditProduct, 
  addToCart 
}: { 
  product: Product;
  category: Category;
  isAdmin: boolean;
  onProductClick: (product: Product) => void;
  onEditProduct?: (product: Product) => void;
  addToCart: (product: Product) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: product.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.7 : 1,
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition border border-stone-100 ${isDragging ? 'shadow-xl ring-2 ring-rose-400' : ''}`}
    >
      {/* Drag Handle (только для админа) */}
      {isAdmin && (
        <div 
          {...attributes} 
          {...listeners}
          className="absolute top-2 left-2 z-30 bg-white/90 hover:bg-stone-800 hover:text-white text-stone-600 p-2 rounded-full shadow-md transition cursor-grab active:cursor-grabbing touch-none"
          title="Перетащить"
        >
          ⠿
        </div>
      )}

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
          <div className="flex items-center justify-between">
            <p className="text-rose-500 font-bold">{product.price} ₽</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product);
              }}
              className="bg-rose-400 hover:bg-rose-500 text-white p-2 rounded-lg transition shadow-sm"
              title="В корзину"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CategorySection({ category, onProductClick, onEditProduct, isOpenDefault = false }: CategorySectionProps) {
  const [isOpen, setIsOpen] = useState(isOpenDefault);
  const { products: fetchedProducts, loading } = useProductsByCategory(isOpen ? category.id : null);
  const [products, setProducts] = useState<Product[]>([]);
  const [hasOrderChanged, setHasOrderChanged] = useState(false);
  const [saving, setSaving] = useState(false);
  const { isAdmin } = useAdmin();
  const { addToCart } = useCart();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Sync products from hook
  useEffect(() => {
    setProducts(fetchedProducts);
    setHasOrderChanged(false);
  }, [fetchedProducts]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setProducts((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      setHasOrderChanged(true);
    }
  };

  const handleSaveOrder = async () => {
    setSaving(true);
    try {
      await reorderProducts(products);
      setHasOrderChanged(false);
    } catch (error) {
      alert('Ошибка сохранения: ' + (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border-b border-stone-200 last:border-0">
      {/* Заголовок-аккордеон */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-8 flex items-center justify-between group text-left"
      >
        <div className="flex items-center gap-4">
          {/* Приоритет эмодзи, обложка только если нет эмодзи */}
          {category.emoji ? (
            <span className="text-4xl">{category.emoji}</span>
          ) : category.imageUrl ? (
            <div className="w-16 h-16 rounded-xl overflow-hidden relative flex-shrink-0 border border-stone-200">
              <Image
                src={category.imageUrl}
                alt={category.name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <span className="text-4xl">🌸</span>
          )}
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
            <>
              {/* Кнопка сохранения порядка (для админа) */}
              {isAdmin && hasOrderChanged && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between">
                  <span className="text-rose-700 font-medium text-sm">Порядок изменён</span>
                  <button
                    onClick={handleSaveOrder}
                    disabled={saving}
                    className="px-4 py-2 bg-rose-500 text-white rounded-lg font-bold hover:bg-rose-600 transition disabled:opacity-50 text-sm"
                  >
                    {saving ? 'Сохраняем...' : '💾 Сохранить порядок'}
                  </button>
                </div>
              )}

              {isAdmin ? (
                <DndContext 
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext 
                    items={products.map(p => p.id)}
                    strategy={rectSortingStrategy}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
                      {products.map((product) => (
                        <SortableProductCard
                          key={product.id}
                          product={product}
                          category={category}
                          isAdmin={isAdmin}
                          onProductClick={onProductClick}
                          onEditProduct={onEditProduct}
                          addToCart={addToCart}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
                  {products.map((product) => (
                    <SortableProductCard
                      key={product.id}
                      product={product}
                      category={category}
                      isAdmin={false}
                      onProductClick={onProductClick}
                      onEditProduct={onEditProduct}
                      addToCart={addToCart}
                    />
                  ))}
                </div>
              )}
            </>
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
