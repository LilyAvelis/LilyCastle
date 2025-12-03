#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Bug Config Script - Управление конфигурацией жуков
Категория: bug-config
"""

import os
import json

def find_all_bugs(root_path):
    """Находит все жуки и возвращает список с путями к .bug файлам."""
    bugs = []
    for dirpath, dirnames, filenames in os.walk(root_path):
        if '.bug' in filenames:
            bug_file = os.path.join(dirpath, '.bug')
            bugs.append(bug_file)
    return bugs

def add_key_to_bugs(root_path, key, default_value):
    """Добавляет ключ со значением ко всем жукам."""
    bugs = find_all_bugs(root_path)
    updated = 0
    
    for bug_file in bugs:
        try:
            with open(bug_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Добавляем ключ, если его нет
            if key not in data:
                data[key] = default_value
                with open(bug_file, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                print(f"✓ Добавлен {key}={default_value} к {os.path.basename(os.path.dirname(bug_file))}")
                updated += 1
            else:
                print(f"→ {key} уже существует в {os.path.basename(os.path.dirname(bug_file))}")
        except Exception as e:
            print(f"✗ Ошибка в {bug_file}: {e}")
    
    print(f"\nОбновлено: {updated} жуков")

def update_bug_property(root_path, bug_name, key, value):
    """Обновляет свойство конкретного жука."""
    bugs = find_all_bugs(root_path)
    
    for bug_file in bugs:
        try:
            with open(bug_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            if data.get('name') == bug_name:
                data[key] = value
                with open(bug_file, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                print(f"✓ Обновлено {bug_name}: {key}={value}")
                return True
        except Exception as e:
            print(f"✗ Ошибка в {bug_file}: {e}")
    
    print(f"✗ Жук {bug_name} не найден")
    return False

def list_all_bugs(root_path):
    """Выводит список всех жуков с их свойствами."""
    bugs = find_all_bugs(root_path)
    
    print("\n📋 Все жуки в проекте:\n")
    for bug_file in sorted(bugs):
        try:
            with open(bug_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            name = data.get('name', 'Неизвестно')
            emoji = data.get('emoji', '🐛')
            room = data.get('original_room', 'Неизвестно')
            print(f"{emoji} {name} - Комната: {room}")
        except Exception as e:
            print(f"✗ Ошибка: {e}")

if __name__ == "__main__":
    root_path = r"c:\Users\Public\LilyCastle"
    
    # Добавляем emoji ко всем жукам
    print("🔧 Добавление emoji ко всем жукам...\n")
    add_key_to_bugs(root_path, 'emoji', '🐛')
    
    # Выводим список всех жуков
    list_all_bugs(root_path)