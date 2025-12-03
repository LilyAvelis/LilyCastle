import { spawn } from 'child_process';
import { NextResponse } from 'next/server';

export async function POST() {
  return new Promise((resolve) => {
    const bugManagerPath = 'c:\\Users\\Public\\LilyCastle\\Тронный-зал\\ЖучиныйМенеджер';
    
    const python = spawn('python', ['bug-shuffle.py'], {
      cwd: bugManagerPath,
    });

    python.on('close', (code) => {
      if (code === 0) {
        resolve(NextResponse.json({ 
          message: '✅ Жуки перемешаны! 🔀',
          success: true 
        }));
      } else {
        resolve(NextResponse.json({ 
          message: '❌ Ошибка при перемешивании',
          success: false 
        }, { status: 500 }));
      }
    });

    python.on('error', (error) => {
      console.error('Ошибка запуска скрипта:', error);
      resolve(NextResponse.json({ 
        message: '❌ Ошибка при запуске скрипта',
        success: false 
      }, { status: 500 }));
    });
  });
}
