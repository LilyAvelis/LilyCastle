import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  writeBatch,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Product, Category } from '@/types';

// --- Categories ---

export async function addCategory(categoryData: Omit<Category, 'id' | 'createdAt'>) {
  try {
    const docRef = await addDoc(collection(db, 'categories'), {
      ...categoryData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding category:', error);
    throw error;
  }
}

export async function updateCategory(id: string, data: Partial<Category>, imageFile?: File) {
  try {
    let imageUrl = data.imageUrl;

    // Если есть файл обложки, загружаем в Storage
    if (imageFile) {
      try {
        imageUrl = await uploadCategoryImage(imageFile);
      } catch (storageError) {
        console.error('Storage upload error:', storageError);
        throw new Error('Ошибка загрузки обложки. Убедитесь, что Firebase Storage включен.');
      }
    }

    const categoryRef = doc(db, 'categories', id);
    const updateData: Partial<Category> = { ...data };
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    
    await updateDoc(categoryRef, updateData);
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
}

export async function deleteCategory(id: string) {
  try {
    const batch = writeBatch(db);
    
    // 1. Move products to 'undefined'
    const productsRef = collection(db, 'products');
    const q = query(productsRef, where('categoryId', '==', id));
    const snapshot = await getDocs(q);
    
    snapshot.forEach((doc) => {
      batch.update(doc.ref, { categoryId: 'undefined' });
    });

    // 2. Delete category
    const categoryRef = doc(db, 'categories', id);
    batch.delete(categoryRef);

    await batch.commit();
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
}

export async function reorderCategories(categories: Category[]) {
  try {
    const batch = writeBatch(db);
    categories.forEach((cat, index) => {
      const ref = doc(db, 'categories', cat.id);
      batch.update(ref, { order: index });
    });
    await batch.commit();
  } catch (error) {
    console.error('Error reordering categories:', error);
    throw error;
  }
}

export async function getUndefinedProductsCount() {
  try {
    const productsRef = collection(db, 'products');
    const q = query(productsRef, where('categoryId', '==', 'undefined'));
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('Error counting undefined products:', error);
    return 0;
  }
}

export async function clearUndefinedProducts() {
  try {
    const productsRef = collection(db, 'products');
    const q = query(productsRef, where('categoryId', '==', 'undefined'));
    const snapshot = await getDocs(q);
    
    const batch = writeBatch(db);
    snapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error clearing undefined products:', error);
    throw error;
  }
}

// --- Products ---

export async function addProduct(productData: Omit<Product, 'id' | 'createdAt'>, imageFile?: File) {
  try {
    let imageUrl = productData.imageUrl || '';

    // Если есть файл, грузим в Storage
    if (imageFile) {
      try {
        imageUrl = await uploadImage(imageFile);
      } catch (storageError) {
        console.error('Storage upload error:', storageError);
        throw new Error('Ошибка загрузки фото. Убедитесь, что Firebase Storage включен в консоли Firebase.');
      }
    }

    // Очищаем undefined поля, Firestore их не любит
    const cleanData = Object.fromEntries(
      Object.entries({
        ...productData,
        imageUrl,
        createdAt: serverTimestamp(),
        order: 999
      }).filter(([_, v]) => v !== undefined)
    );

    const docRef = await addDoc(collection(db, 'products'), cleanData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
}

export async function updateProduct(id: string, data: Partial<Product>, imageFile?: File) {
  try {
    let imageUrl = data.imageUrl;

    if (imageFile) {
      try {
        imageUrl = await uploadImage(imageFile);
      } catch (storageError) {
        console.error('Storage upload error:', storageError);
        throw new Error('Ошибка загрузки фото. Убедитесь, что Firebase Storage включен в консоли Firebase.');
      }
    }

    const productRef = doc(db, 'products', id);
    
    // Формируем объект обновления, исключая undefined
    const updateData: any = { ...data };
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    
    await updateDoc(productRef, updateData);
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}

export async function deleteProduct(id: string) {
  try {
    await deleteDoc(doc(db, 'products', id));
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

export async function reorderProducts(products: Product[]) {
  try {
    const batch = writeBatch(db);
    products.forEach((product, index) => {
      const ref = doc(db, 'products', product.id);
      batch.update(ref, { order: index });
    });
    await batch.commit();
  } catch (error) {
    console.error('Error reordering products:', error);
    throw error;
  }
}

// --- Helpers ---

async function uploadImage(file: File): Promise<string> {
  const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
}

async function uploadCategoryImage(file: File): Promise<string> {
  const storageRef = ref(storage, `categories/${Date.now()}_${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
}
