'use client';

import { useState } from 'react';
import { useCategories } from '@/hooks/useCategories';
import { Product } from '@/types';
import Header from '@/components/01-Header';
import Footer from '@/components/05-Footer';
import CategorySection from '@/components/Catalog/CategorySection';
import ProductModal from '@/components/Catalog/ProductModal';
import AdminBar from '@/components/Admin/AdminBar';
import ProductFormModal from '@/components/Admin/ProductFormModal';
import CategoryManagerModal from '@/components/Admin/CategoryManagerModal';

export default function CatalogPage() {
  const { categories, loading } = useCategories();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Admin State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);

  const handleAddProduct = () => {
    setEditingProduct(undefined);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <AdminBar 
        onAddProduct={handleAddProduct} 
        onManageCategories={() => setIsCategoryManagerOpen(true)}
      />
      <Header />

      <main className="pt-12 pb-24">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-4 text-center">
            Наши коллекции
          </h1>
          <p className="text-stone-800 text-lg text-center mb-16 max-w-2xl mx-auto font-medium">
            Выбирайте сердцем. Каждая композиция создана вручную с любовью к деталям и вкусу.
          </p>

          {loading ? (
            <div className="text-center py-20 text-stone-600 font-medium">Загрузка каталога...</div>
          ) : (
            <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-6 md:p-12">
              {categories.map((category, index) => (
                <CategorySection 
                  key={category.id} 
                  category={category}
                  onProductClick={setSelectedProduct}
                  onEditProduct={handleEditProduct}
                  isOpenDefault={index === 0} // Открываем первую категорию по умолчанию
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Модальное окно товара (просмотр) */}
      <ProductModal 
        product={selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
      />

      {/* Модальное окно админа (создание/редактирование) */}
      {isFormOpen && (
        <ProductFormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          productToEdit={editingProduct}
          categories={categories}
        />
      )}

      {/* Модальное окно управления категориями */}
      {isCategoryManagerOpen && (
        <CategoryManagerModal
          isOpen={isCategoryManagerOpen}
          onClose={() => setIsCategoryManagerOpen(false)}
          categories={categories}
        />
      )}
    </div>
  );
}
