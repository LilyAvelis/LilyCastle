"""
Lily Numbers UI
Простой интерфейс для визуализации константы ускорения
"""

import tkinter as tk
from tkinter import ttk, messagebox
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
from data_series import compute_multiple_levels
import threading

class LilyNumbersUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Константа Ускорения Рядов Лилии")
        self.root.geometry("1200x800")

        # Переменные
        self.max_n = tk.IntVar(value=50)
        self.num_primes = tk.IntVar(value=40)
        self.is_computing = False

        self.create_widgets()

    def create_widgets(self):
        # Панель управления
        control_frame = ttk.Frame(self.root, padding="10")
        control_frame.pack(fill=tk.X)

        ttk.Label(control_frame, text="Макс. уровень n:").grid(row=0, column=0, sticky=tk.W)
        ttk.Spinbox(control_frame, from_=10, to=100, textvariable=self.max_n, width=10).grid(row=0, column=1)

        ttk.Label(control_frame, text="Количество простых:").grid(row=0, column=2, sticky=tk.W, padx=(20,0))
        ttk.Spinbox(control_frame, from_=20, to=200, textvariable=self.num_primes, width=10).grid(row=0, column=3)

        ttk.Button(control_frame, text="Построить график", command=self.plot_acceleration).grid(row=0, column=4, padx=(20,0))

        # Прогресс бар
        self.progress = ttk.Progressbar(control_frame, orient=tk.HORIZONTAL, length=300, mode='indeterminate')
        self.progress.grid(row=1, column=0, columnspan=5, pady=(10,0))

        # Область для графика
        self.plot_frame = ttk.Frame(self.root)
        self.plot_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

        # Информационная панель
        info_frame = ttk.Frame(self.root, padding="10")
        info_frame.pack(fill=tk.X)

        self.info_label = ttk.Label(info_frame, text="Готов к работе", foreground="blue")
        self.info_label.pack()

    def plot_acceleration(self):
        if self.is_computing:
            return

        self.is_computing = True
        self.progress.start()
        self.info_label.config(text="Вычисление...", foreground="orange")

        # Запуск в отдельном потоке
        thread = threading.Thread(target=self.compute_and_plot)
        thread.daemon = True
        thread.start()

    def compute_and_plot(self):
        try:
            max_n = self.max_n.get()
            num_primes = self.num_primes.get()

            # Вычисление
            series = compute_multiple_levels(max_n, num_primes)

            # Вычисление констант ускорения
            accelerations = []
            levels = []

            for level in range(2, max_n + 1):
                L_n = series[level]
                L_prev = series[level - 1]
                L_prev2 = series[level - 2]

                accel = []
                for i in range(min(len(L_n), len(L_prev), len(L_prev2))):
                    if L_prev2[i] != 0 and L_prev[i] != 0:
                        growth_prev = L_prev[i] / L_prev2[i]
                        growth_curr = L_n[i] / L_prev[i]
                        if growth_prev != 0:
                            accel.append(growth_curr / growth_prev)

                if accel:
                    avg_accel = sum(accel) / len(accel)
                    accelerations.append(avg_accel)
                    levels.append(level)

            # Построение графика в главном потоке
            self.root.after(0, lambda: self.display_plot(levels, accelerations))

        except Exception as e:
            self.root.after(0, lambda: messagebox.showerror("Ошибка", f"Произошла ошибка: {str(e)}"))
        finally:
            self.root.after(0, self.finish_computation)

    def display_plot(self, levels, accelerations):
        # Очистка предыдущего графика
        for widget in self.plot_frame.winfo_children():
            widget.destroy()

        # Создание фигуры matplotlib
        fig, ax = plt.subplots(figsize=(10, 6))

        # График
        ax.plot(levels, accelerations, marker='o', linestyle='-', linewidth=2, markersize=6,
                color='#2E86AB', label='Константа ускорения')

        # Предел
        if len(accelerations) > 10:
            limit = sum(accelerations[-10:]) / 10
            ax.axhline(y=limit, color='#F24236', linestyle='--', linewidth=2,
                      label=f'Предел ≈ {limit:.6f}')

            # Зона сходимости
            ax.fill_between(levels[-10:], [limit-0.001]*10, [limit+0.001]*10,
                           color='#F24236', alpha=0.1, label='Зона сходимости')

        ax.set_xlabel('Уровень интеграции n', fontsize=12)
        ax.set_ylabel('Константа ускорения', fontsize=12)
        ax.set_title('Константа Ускорения Рядов Лилии\n(Предельное значение ≈ 0.9935)',
                    fontsize=14, fontweight='bold')
        ax.legend(fontsize=10)
        ax.grid(True, alpha=0.3)
        ax.set_ylim(0.7, 1.0)

        # Встраивание в tkinter
        canvas = FigureCanvasTkAgg(fig, master=self.plot_frame)
        canvas.draw()
        canvas.get_tk_widget().pack(fill=tk.BOTH, expand=True)

    def finish_computation(self):
        self.progress.stop()
        self.is_computing = False
        self.info_label.config(text="Готово!", foreground="green")

def main():
    root = tk.Tk()
    app = LilyNumbersUI(root)
    root.mainloop()

if __name__ == "__main__":
    main()