'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

interface Bug {
  name: string;
  emoji: string;
  language?: string;
  description?: string;
}

interface RoomInfo {
  id: string;
  label: string;
  bugs: Bug[];
}

const roomNameCollator = new Intl.Collator('ru', { numeric: true, sensitivity: 'base' });

async function loadBugs(): Promise<RoomInfo[]> {
  const response = await fetch('/api/bugs', { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Не удалось загрузить жуков');
  }
  return response.json();
}

async function shuffleBugs() {
  const response = await fetch('/api/shuffle', { method: 'POST' });
  if (!response.ok) {
    throw new Error('Не удалось перемешать жуков');
  }
  return response.json();
}

function formatBugCount(count: number) {
  if (count === 0) return 'Пусто';
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return `${count} жук`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} жука`;
  return `${count} жуков`;
}

export default function Home() {
  const [rooms, setRooms] = useState<RoomInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('Готово!');
  const [error, setError] = useState<string | null>(null);
  const [isShuffling, setIsShuffling] = useState(false);

  const fetchRooms = useCallback(async (showLoader = true) => {
    try {
      setError(null);
      if (showLoader) {
        setLoading(true);
      }
      const data = await loadBugs();
      setRooms(data);
    } catch (err) {
      console.error(err);
      setError('Не удалось загрузить карту.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleShuffle = async () => {
    setIsShuffling(true);
    setStatus('Перемешиваем жуков...');
    try {
      const result = await shuffleBugs();
      setStatus(result.message ?? '✅ Жуки перемешаны!');
      await fetchRooms(false);
    } catch (err) {
      console.error(err);
      setStatus('❌ Ошибка при перемешивании');
    } finally {
      setIsShuffling(false);
    }
  };

  const orderedRooms = useMemo(
    () => [...rooms].sort((a, b) => roomNameCollator.compare(a.id, b.id)),
    [rooms]
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-purple-300/80">Тактический штаб</p>
          <h1 className="mt-3 text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-300 sm:text-5xl">
            🗿 Карта замка LilyCastle
          </h1>
          <p className="mt-3 text-slate-300">Живой статус комнат и жучьих гарнизонов</p>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <button
            onClick={handleShuffle}
            disabled={isShuffling || loading}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-3 text-lg font-semibold text-white shadow-lg shadow-purple-500/40 transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isShuffling ? '🔄 Перемешиваем...' : '🔀 Shuffle жуков'}
          </button>
          <div className="rounded-2xl border border-white/5 bg-white/5 px-6 py-3 text-sm text-slate-200">
            {status}
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-center text-sm text-red-100">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-12 flex flex-col items-center gap-4 text-slate-400">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-transparent" />
            <p>Загружаем данные о жучьей армии...</p>
          </div>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {orderedRooms.map((room) => (
              <div
                key={room.id}
                className="h-full rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900/70 to-slate-950/70 p-5 shadow-2xl shadow-black/40 backdrop-blur"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{room.id}</p>
                    <h2 className="mt-1 text-2xl font-bold text-white">{room.label}</h2>
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-100">
                    {formatBugCount(room.bugs.length)}
                  </span>
                </div>

                {room.bugs.length ? (
                  <ul className="mt-5 space-y-3">
                    {room.bugs.map((bug, index) => (
                      <li
                        key={`${room.id}-${bug.name}-${index}`}
                        className="flex items-start gap-3 rounded-2xl bg-white/5 px-3 py-2"
                      >
                        <span className="text-2xl" aria-hidden>
                          {bug.emoji ?? '🐛'}
                        </span>
                        <div>
                          <p className="font-semibold text-white">{bug.name}</p>
                          <p className="text-xs uppercase tracking-wide text-slate-400">
                            {bug.language ?? '??'}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="mt-6 flex h-32 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 text-slate-500">
                    <span className="text-3xl">🌿</span>
                    <p className="mt-2 text-sm">Комната чиста, жуков нет</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
