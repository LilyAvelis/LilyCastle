#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Bug Web UI Script - Веб-интерфейс для управления жуками с Gradio
Категория: bug-ui-web
"""

import gradio as gr
import os
import json
import subprocess

def get_rooms(root_path):
    """Получить список комнат в порядке 01-15."""
    rooms = []
    for i in range(1, 16):
        prefix = f"{i:02d}-"
        found = [d for d in os.listdir(root_path) if os.path.isdir(os.path.join(root_path, d)) and d.startswith(prefix)]
        if found:
            rooms.append(found[0])
    return rooms

def scan_bugs(root_path):
    """Сканирует жуков и группирует по комнатам с emoji."""
    bugs_by_room = {}
    for dirpath, dirnames, filenames in os.walk(root_path):
        if '.bug' in filenames:
            bug_file = os.path.join(dirpath, '.bug')
            try:
                with open(bug_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                room = os.path.basename(os.path.dirname(dirpath))
                if room not in bugs_by_room:
                    bugs_by_room[room] = []
                bug_info = {
                    'name': data['name'],
                    'emoji': data.get('emoji', '🐛')
                }
                bugs_by_room[room].append(bug_info)
            except Exception as e:
                print(f"Ошибка чтения {bug_file}: {e}")
    return bugs_by_room

def generate_html_map(root_path):
    """Генерирует HTML карту замка 4x4 с динамическими emoji."""
    rooms = get_rooms(root_path)
    bugs_by_room = scan_bugs(root_path)
    
    css_style = """
    <style>
        .bug-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            padding: 20px;
            max-width: 900px;
            margin: 0 auto;
        }
        .bug-cell {
            border: 2px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
            background-color: #f9f9f9;
            min-height: 120px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            transition: transform 0.2s;
        }
        .bug-cell:hover {
            transform: scale(1.05);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        .room-name {
            font-weight: bold;
            font-size: 12px;
            color: #000;
            margin-bottom: 8px;
        }
        .bug-icons {
            font-size: 36px;
            min-height: 40px;
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 5px;
            line-height: 1.2;
        }
        .bug-name {
            font-size: 11px;
            color: #000;
            margin-top: 5px;
            font-style: italic;
        }
        .empty {
            color: #ccc;
        }
    </style>
    """
    
    html = css_style + '<div class="bug-grid">'
    
    for i, room in enumerate(rooms):
        bugs = bugs_by_room.get(room, [])
        
        if bugs:
            emoji_size = max(14, 36 - (len(bugs) - 1) * 4)
            emojis = "".join([bug['emoji'] for bug in bugs])
            bug_names = ", ".join([bug['name'] for bug in bugs])
            bug_html = f'<div class="bug-icons" style="font-size: {emoji_size}px">{emojis}</div><div class="bug-name">{bug_names}</div>'
        else:
            bug_html = '<div class="bug-icons empty">∅</div>'
        
        html += f'<div class="bug-cell"><div class="room-name">{room}</div>{bug_html}</div>'
    
    html += '</div>'
    return html

def shuffle_bugs():
    """Запускает shuffle скрипт."""
    try:
        subprocess.run(["python", "bug-shuffle.py"], cwd=os.path.dirname(__file__), check=True)
        return "✅ Жуки перемешаны! 🔀"
    except subprocess.CalledProcessError as e:
        return f"❌ Ошибка: {e}"

def update_map():
    """Обновляет карту."""
    root_path = r"c:\Users\Public\LilyCastle"
    return generate_html_map(root_path)

def on_shuffle():
    """Запускает shuffle и возвращает обновленную карту."""
    msg = shuffle_bugs()
    new_map = update_map()
    return msg, new_map

# Gradio интерфейс
with gr.Blocks(title="Жучиный Менеджер 🗿") as demo:
    gr.Markdown("# 🗿 Карта Замка LilyCastle")
    
    map_display = gr.HTML(value=update_map())
    
    with gr.Row():
        shuffle_btn = gr.Button("🔀 Shuffle Жуков", size="lg")
        status = gr.Textbox(label="Статус", interactive=False, value="Готово!")
    
    shuffle_btn.click(fn=on_shuffle, outputs=[status, map_display])

if __name__ == "__main__":
    demo.launch()