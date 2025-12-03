'use client';

import { useState, useEffect } from 'react';
import { useCart, CartItem } from '@/context/CartContext';
import Image from 'next/image';

interface OrderForm {
  name: string;
  phone: string;
  email: string;
  comment: string;
}

// Telegram бот для заказов
const TELEGRAM_BOT_TOKEN = '8506987502:AAFAi9czKeiFwQwzNZbWvVQIhO-R0jmuaF0';
// ID группы для заказов (начинается с -100)
// Чтобы узнать ID: добавь бота в группу → напиши сообщение → перешли @getmyid_bot
const TELEGRAM_GROUP_ID = '-1003357638694'; // ID группы "Сайт Страуса"
// Личный ID для дублирования (опционально)
const TELEGRAM_PERSONAL_ID = '8239710952'; // Можно убрать, если не нужно дублирование

export default function CartSidebar() {
  const { items, isOpen, closeCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice } = useCart();
  const [form, setForm] = useState<OrderForm>({ name: '', phone: '', email: '', comment: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Блокируем скролл при открытии
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Закрытие по Esc
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [closeCart]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const formatOrderMessage = (orderItems: CartItem[], orderForm: OrderForm, total: number) => {
    const itemsList = orderItems
      .map(item => `• ${item.product.name} x${item.quantity} — ${item.product.price * item.quantity} ₽`)
      .join('\n');

    return `🌹 *НОВЫЙ ЗАКАЗ*

👤 *Клиент:* ${orderForm.name}
📱 *Телефон:* ${orderForm.phone}
📧 *Email:* ${orderForm.email}
${orderForm.comment ? `💬 *Комментарий:* ${orderForm.comment}` : ''}

🛒 *Товары:*
${itemsList}

💰 *Итого:* ${total} ₽

📅 ${new Date().toLocaleString('ru-RU')}`;
  };

  const sendToTelegram = async (message: string) => {
    const sendToChat = async (chatId: string) => {
      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown',
        }),
      });
      return response.ok;
    };

    try {
      // Отправляем в группу (основной канал для заказов)
      const groupSuccess = await sendToChat(TELEGRAM_GROUP_ID);
      
      // Дублируем на личный ID (опционально, можно закомментировать)
      // await sendToChat(TELEGRAM_PERSONAL_ID);
      
      return groupSuccess;
    } catch (error) {
      console.error('Error sending to Telegram:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name || !form.phone || !form.email) {
      alert('Пожалуйста, заполните обязательные поля');
      return;
    }

    if (items.length === 0) {
      alert('Корзина пуста');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    const message = formatOrderMessage(items, form, totalPrice);
    const success = await sendToTelegram(message);

    if (success) {
      setSubmitStatus('success');
      clearCart();
      setForm({ name: '', phone: '', email: '', comment: '' });
      
      // Закрываем через 3 секунды
      setTimeout(() => {
        closeCart();
        setSubmitStatus('idle');
      }, 3000);
    } else {
      setSubmitStatus('error');
    }

    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Оверлей */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closeCart}
      />

      {/* Сайдбар */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-stone-200">
          <h2 className="text-xl md:text-2xl font-bold text-black flex items-center gap-2">
            🛒 Корзина
            {totalItems > 0 && (
              <span className="bg-rose-500 text-white text-sm px-2 py-0.5 rounded-full">
                {totalItems}
              </span>
            )}
          </h2>
          <button
            onClick={closeCart}
            className="text-stone-400 hover:text-black transition p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Статус успешной отправки */}
        {submitStatus === 'success' && (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-green-600 mb-2">Заказ отправлен!</h3>
              <p className="text-stone-600">Мы скоро свяжемся с вами</p>
            </div>
          </div>
        )}

        {/* Статус ошибки */}
        {submitStatus === 'error' && (
          <div className="bg-red-50 p-4 mx-4 mt-4 rounded-xl border border-red-200">
            <p className="text-red-600 text-center">
              Ошибка отправки. Попробуйте позже или позвоните нам.
            </p>
          </div>
        )}

        {submitStatus === 'idle' && (
          <>
            {/* Список товаров */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {items.length === 0 ? (
                <div className="text-center py-12 text-stone-400">
                  <div className="text-5xl mb-4">🌸</div>
                  <p className="text-lg">Корзина пуста</p>
                  <p className="text-sm mt-2">Выберите букет из каталога</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <CartItemCard
                      key={item.product.id}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeFromCart}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Форма заказа (если есть товары) */}
            {items.length > 0 && (
              <div className="border-t border-stone-200 p-4 md:p-6 bg-stone-50">
                {/* Итого */}
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-medium text-stone-600">Итого:</span>
                  <span className="text-2xl font-bold text-rose-600">{totalPrice} ₽</span>
                </div>

                {/* Форма */}
                <form onSubmit={handleSubmit} className="space-y-3">
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    placeholder="Ваше имя *"
                    required
                    className="w-full p-3 rounded-xl border border-stone-300 outline-none focus:ring-2 focus:ring-rose-500 text-black"
                  />
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleInputChange}
                    placeholder="Телефон *"
                    required
                    className="w-full p-3 rounded-xl border border-stone-300 outline-none focus:ring-2 focus:ring-rose-500 text-black"
                  />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    placeholder="Email *"
                    required
                    className="w-full p-3 rounded-xl border border-stone-300 outline-none focus:ring-2 focus:ring-rose-500 text-black"
                  />
                  <textarea
                    name="comment"
                    value={form.comment}
                    onChange={handleInputChange}
                    placeholder="Комментарий к заказу (необязательно)"
                    rows={2}
                    className="w-full p-3 rounded-xl border border-stone-300 outline-none focus:ring-2 focus:ring-rose-500 text-black resize-none"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-rose-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-rose-600 transition shadow-lg shadow-rose-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        Отправляем...
                      </>
                    ) : (
                      <>📨 Отправить заказ</>
                    )}
                  </button>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Компонент карточки товара в корзине
function CartItemCard({ 
  item, 
  onUpdateQuantity, 
  onRemove 
}: { 
  item: CartItem; 
  onUpdateQuantity: (id: string, qty: number) => void; 
  onRemove: (id: string) => void; 
}) {
  return (
    <div className="flex gap-3 bg-white p-3 rounded-xl border border-stone-100 shadow-sm">
      {/* Фото */}
      <div className="w-20 h-20 relative rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
        {item.product.imageUrl ? (
          <Image
            src={item.product.imageUrl}
            alt={item.product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">🌸</div>
        )}
      </div>

      {/* Информация */}
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-stone-800 truncate">{item.product.name}</h4>
        <p className="text-rose-500 font-bold">{item.product.price} ₽</p>
        
        {/* Кнопки управления количеством */}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
            className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 transition flex items-center justify-center font-bold text-stone-600"
          >
            −
          </button>
          <span className="w-8 text-center font-bold text-black">{item.quantity}</span>
          <button
            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
            className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 transition flex items-center justify-center font-bold text-stone-600"
          >
            +
          </button>
        </div>
      </div>

      {/* Кнопка удаления */}
      <button
        onClick={() => onRemove(item.product.id)}
        className="text-stone-400 hover:text-red-500 transition p-1 self-start"
        title="Удалить"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}
