#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Bug UI Script - Графический интерфейс для управления жуками
Категория: bug-ui
"""

import tkinter as tk
from tkinter import ttk
import os
import json
import subprocess

class BugUI:
    def __init__(self, root_path):
        self.root_path = root_path
        self.bugs = {}
        self.rooms = self.get_rooms()
        self.scan_bugs()

        self.root = tk.Tk()
        self.root.title("Жучиный Менеджер 🗿 - Карта Замка")
        self.create_ui()

    def get_rooms(self):
        """Получить список комнат в порядке 4x4."""
        all_rooms = [f"{i:02d}-" for i in range(1, 17)]  # 01- до 16-
        existing_rooms = [d for d in os.listdir(self.root_path) if os.path.isdir(os.path.join(self.root_path, d)) and d.startswith(('01-', '02-', '03-', '04-', '05-', '06-', '07-', '08-', '09-', '10-', '11-', '12-', '13-', '14-', '15-'))]
        rooms = []
        for r in all_rooms:
            if any(er.startswith(r) for er in existing_rooms):
                rooms.append(next(er for er in existing_rooms if er.startswith(r)))
            else:
                rooms.append(r + "Пусто")
        return rooms

    def scan_bugs(self):
        """Сканирует жуков и связывает с комнатами."""
        self.bugs = {}
        for dirpath, dirnames, filenames in os.walk(self.root_path):
            if '.bug' in filenames:
                bug_file = os.path.join(dirpath, '.bug')
                try:
                    with open(bug_file, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                    room = os.path.basename(os.path.dirname(dirpath))
                    self.bugs[room] = data['name']
                except Exception as e:
                    print(f"Ошибка чтения {bug_file}: {e}")

    def create_ui(self):
        """Создает UI с таблицей 4x4 и кнопкой shuffle."""
        frame = ttk.Frame(self.root, padding="10")
        frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))

        # Таблица 4x4
        for i in range(4):
            for j in range(4):
                idx = i * 4 + j
                if idx < len(self.rooms):
                    room = self.rooms[idx]
                    bug_name = self.bugs.get(room, "Нет жука")
                    emoji = "🐛" if bug_name != "Нет жука" else ""
                    text = f"{room}\n{emoji} {bug_name}"
                    label = ttk.Label(frame, text=text, borderwidth=2, relief="solid", padding="5")
                    label.grid(row=i, column=j, padx=5, pady=5, sticky=(tk.W, tk.E, tk.N, tk.S))

        # Кнопка Shuffle
        shuffle_btn = ttk.Button(frame, text="Shuffle Жуков 🔀", command=self.shuffle)
        shuffle_btn.grid(row=4, column=0, columnspan=4, pady=10)

    def shuffle(self):
        """Запускает shuffle скрипт и обновляет UI."""
        try:
            subprocess.run(["python", "bug-shuffle.py"], cwd=os.path.dirname(__file__), check=True)
            self.scan_bugs()
            # Пересоздать UI
            for widget in self.root.winfo_children():
                widget.destroy()
            self.create_ui()
        except subprocess.CalledProcessError as e:
            print(f"Ошибка запуска shuffle: {e}")

    def run(self):
        self.root.mainloop()

if __name__ == "__main__":
    root_path = r"c:\Users\Public\LilyCastle"
    ui = BugUI(root_path)
    ui.run()