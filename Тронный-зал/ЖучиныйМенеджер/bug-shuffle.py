#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Bug Shuffle Script - Перемешивает жуков между комнатами
Категория: bug-shuffle
"""

import os
import json
import random
import shutil

def shuffle_bugs(root_path):
    """Рандомно перемешивает жуков между комнатами, каждый жук обязательно перемещается в другую комнату."""
    bugs = []
    # Сканируем жуков
    for dirpath, dirnames, filenames in os.walk(root_path):
        if '.bug' in filenames:
            bug_file = os.path.join(dirpath, '.bug')
            try:
                with open(bug_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                data['path'] = dirpath
                bugs.append(data)
            except Exception as e:
                print(f"Ошибка чтения {bug_file}: {e}")

    print(f"Найдено {len(bugs)} жуков для перемешивания.")

    if len(bugs) < 2:
        print("Недостаточно жуков для перемешивания.")
        return

    # Получить список комнат
    rooms = [d for d in os.listdir(root_path) if os.path.isdir(os.path.join(root_path, d)) and d.startswith(('01-', '02-', '03-', '04-', '05-', '06-', '07-', '08-', '09-', '10-', '11-', '12-', '13-', '14-', '15-'))]

    if len(rooms) < 2:
        print("Недостаточно комнат для перемешивания.")
        return

    for bug in bugs:
        current_room = os.path.basename(os.path.dirname(bug['path']))
        available_rooms = [r for r in rooms if r != current_room]
        if available_rooms:
            new_room = random.choice(available_rooms)
            new_path = os.path.join(root_path, new_room, os.path.basename(bug['path']))
            try:
                shutil.move(bug['path'], new_path)
                print(f"Перемещен {bug['name']} из {current_room} в {new_room}")
            except Exception as e:
                print(f"Ошибка перемещения {bug['name']}: {e}")
        else:
            print(f"Нет доступных комнат для {bug['name']}")

if __name__ == "__main__":
    root_path = r"c:\Users\Public\LilyCastle"
    shuffle_bugs(root_path)