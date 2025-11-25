'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product } from '@/types';

export function useProductsByCategory(categoryId: string | null) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!categoryId) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'products'),
      where('categoryId', '==', categoryId)
    );
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];
        
        // Сортируем в коде (обход создания индекса)
        data.sort((a, b) => a.order - b.order);
        
        setProducts(data);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching products:', err);
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [categoryId]);

  return { products, loading, error };
}
