'use client';

import { useState } from 'react';

export default function Home() {
  const [message, setMessage] = useState('Привет, Форель!');

  const handleClick = () => {
    setMessage('Ты кликнула на рыбу!');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-800 mb-4">🐟 Форель в Аквариуме</h1>
        <p className="text-xl text-blue-600 mb-6">{message}</p>
        <button
          onClick={handleClick}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Кликни на рыбу
        </button>
      </div>
    </div>
  );
}
