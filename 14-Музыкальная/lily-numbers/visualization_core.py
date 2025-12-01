"""
Lily Numbers Visualization
Визуализация рядов Лилии и их поведения
"""

import matplotlib.pyplot as plt
from data_series import compute_multiple_levels
import numpy as np

def plot_series(series, max_level=5):
    """
    Построение графиков рядов L_0 до L_max_level
    """
    plt.figure(figsize=(12, 8))
    
    for level in range(max_level + 1):
        values = series[level]
        x = list(range(1, len(values) + 1))
        plt.plot(x, values, label=f'L_{level}', marker='o', markersize=3)
    
    plt.xlabel('Индекс элемента')
    plt.ylabel('Значение')
    plt.title('Ряды Лилии: от L_0 до L_' + str(max_level))
    plt.legend()
    plt.yscale('log')  # Логарифмическая шкала для больших значений
    plt.grid(True, alpha=0.3)
    plt.show()

def plot_growth_ratios(series, max_level=10):
    """
    График отношений роста L_n / L_{n-1}
    """
    plt.figure(figsize=(10, 6))
    
    for level in range(1, max_level + 1):
        L_n = series[level]
        L_prev = series[level - 1]
        
        ratios = []
        for i in range(min(len(L_n), len(L_prev))):
            if L_prev[i] != 0:
                ratios.append(L_n[i] / L_prev[i])
        
        x = list(range(1, len(ratios) + 1))
        plt.plot(x, ratios, label=f'L_{level}/L_{level-1}', alpha=0.7)
    
    plt.xlabel('Индекс элемента')
    plt.ylabel('Отношение L_n / L_{n-1}')
    plt.title('Отношения роста между уровнями')
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.show()

def plot_acceleration_constants(series, max_level=10, save_path=None):
    """
    График констант ускорения с пределом
    """
    accelerations = []
    levels = []
    
    for level in range(2, max_level + 1):
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
    
    plt.figure(figsize=(12, 8))
    
    # График констант
    plt.plot(levels, accelerations, marker='o', linestyle='-', linewidth=2, markersize=6, 
             color='#2E86AB', label='Константа ускорения')
    
    # Предел (если сходится)
    if len(accelerations) > 10:
        limit = sum(accelerations[-10:]) / 10  # Среднее последних 10
        plt.axhline(y=limit, color='#F24236', linestyle='--', linewidth=2, 
                   label=f'Предел ≈ {limit:.6f}')
        
        # Зона сходимости
        plt.fill_between(levels[-10:], [limit-0.001]*10, [limit+0.001]*10, 
                        color='#F24236', alpha=0.1, label='Зона сходимости')
    
    plt.xlabel('Уровень интеграции n', fontsize=12)
    plt.ylabel('Константа ускорения', fontsize=12)
    plt.title('Константа Ускорения Рядов Лилии\n(Предельное значение ≈ 0.9935)', fontsize=14, fontweight='bold')
    plt.legend(fontsize=10)
    plt.grid(True, alpha=0.3)
    plt.ylim(0.7, 1.0)
    
    # Стиль
    plt.style.use('seaborn-v0_8')
    
    if save_path:
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
        print(f"График сохранен в {save_path}")
    
    plt.show()

def create_acceleration_dashboard(max_n=50, num_primes=40, save_plots=False):
    """
    Создание дашборда с визуализацией константы ускорения
    """
    print("Создание дашборда константы ускорения...")
    
    series = compute_multiple_levels(max_n, num_primes)
    
    # График константы ускорения
    save_path = "1graph_acceleration_constant.png" if save_plots else None
    plot_acceleration_constants(series, max_n, save_path)
    
    # Дополнительная статистика
    accelerations = []
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
    
    if accelerations:
        final_limit = sum(accelerations[-10:]) / 10
        print(f"\n🎯 Предельная константа ускорения: {final_limit:.6f}")
        print(f"📊 Диапазон изменения: {min(accelerations):.6f} - {max(accelerations):.6f}")
        
        # Скорость сходимости
        diffs = [abs(accelerations[i+1] - accelerations[i]) for i in range(len(accelerations)-1)]
        convergence_rate = sum(diffs[-10:]) / 10
        print(f"⚡ Скорость сходимости (последние 10): {convergence_rate:.2e}")

if __name__ == "__main__":
    # Пример визуализации
    series = compute_multiple_levels(8, 30)
    
    try:
        plot_series(series, 5)
        plot_growth_ratios(series, 8)
        plot_acceleration_constants(series, 8)
    except ImportError:
        print("Matplotlib не установлен. Установите: pip install matplotlib")
        # Альтернативный вывод
        for level, values in series.items():
            print(f"L_{level}: {values[:10]}...")