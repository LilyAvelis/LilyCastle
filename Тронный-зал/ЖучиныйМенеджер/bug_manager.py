import os
import json
import random
import shutil

class BugManager:
    def __init__(self, root_path):
        self.root_path = root_path
        self.bugs = []

    def scan_bugs(self):
        """Сканирует проект на наличие .bug файлов и собирает информацию о жуках."""
        self.bugs = []
        for dirpath, dirnames, filenames in os.walk(self.root_path):
            if '.bug' in filenames:
                bug_file = os.path.join(dirpath, '.bug')
                try:
                    with open(bug_file, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                    data['path'] = dirpath
                    self.bugs.append(data)
                except Exception as e:
                    print(f"Ошибка чтения {bug_file}: {e}")
        print(f"Найдено {len(self.bugs)} жуков.")

    def shuffle_bugs(self):
        """Рандомно перемешивает жуков между комнатами, каждый жук обязательно перемещается в другую комнату."""
        if len(self.bugs) < 2:
            print("Недостаточно жуков для перемешивания.")
            return

        # Получить список комнат (папок верхнего уровня, кроме Тронного зала и других системных)
        rooms = [d for d in os.listdir(self.root_path) if os.path.isdir(os.path.join(self.root_path, d)) and d.startswith(('01-', '02-', '03-', '04-', '05-', '06-', '07-', '08-', '09-', '10-', '11-', '12-', '13-', '14-', '15-'))]
        
        if len(rooms) < 2:
            print("Недостаточно комнат для перемешивания.")
            return

        for bug in self.bugs:
            current_room = os.path.basename(os.path.dirname(bug['path']))
            available_rooms = [r for r in rooms if r != current_room]
            if available_rooms:
                new_room = random.choice(available_rooms)
                new_path = os.path.join(self.root_path, new_room, os.path.basename(bug['path']))
                try:
                    shutil.move(bug['path'], new_path)
                    print(f"Перемещен {bug['name']} из {current_room} в {new_room}")
                except Exception as e:
                    print(f"Ошибка перемещения {bug['name']}: {e}")
            else:
                print(f"Нет доступных комнат для {bug['name']}")

        # Обновить пути после перемещения
        self.scan_bugs()

    def list_bugs(self):
        """Выводит список всех жуков."""
        for bug in self.bugs:
            print(f"Жук: {bug['name']}, Комната: {bug.get('original_room', 'Неизвестно')}, Язык: {bug['language']}")

if __name__ == "__main__":
    manager = BugManager(r"c:\Users\Public\LilyCastle")
    manager.scan_bugs()
    manager.list_bugs()
    
    # Для перемешивания раскомментировать:
    # manager.shuffle_bugs()