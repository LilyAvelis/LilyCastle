"""
Lily Numbers Analysis
Анализ поведения рядов Лилии на высоких порядках
Поиск константы ускорения и законов роста
"""

from data_series import compute_multiple_levels
import math

def analyze_growth(series):
    """
    Анализ роста: вычисление отношений между уровнями
    """
    max_level = max(series.keys())
    analysis = {}
    
    for level in range(1, max_level + 1):
        L_n = series[level]
        L_prev = series[level - 1]
        
        # Отношения L_n[i] / L_{n-1}[i] для первых элементов
        ratios = []
        for i in range(min(len(L_n), len(L_prev))):
            if L_prev[i] != 0:
                ratios.append(L_n[i] / L_prev[i])
        
        analysis[level] = {
            'ratios': ratios,
            'avg_ratio': sum(ratios) / len(ratios) if ratios else 0,
            'last_ratio': ratios[-1] if ratios else 0
        }
    
    return analysis

def find_acceleration_constant(series, max_level=10):
    """
    Поиск константы ускорения
    Гипотеза: рост следует определенному закону
    """
    accelerations = []
    
    for level in range(2, max_level + 1):
        L_n = series[level]
        L_prev = series[level - 1]
        L_prev2 = series[level - 2]
        
        # Ускорение: как меняется скорость роста
        accel = []
        for i in range(min(len(L_n), len(L_prev), len(L_prev2))):
            if L_prev2[i] != 0 and L_prev[i] != 0:
                # Отношение скоростей роста
                growth_prev = L_prev[i] / L_prev2[i]
                growth_curr = L_n[i] / L_prev[i]
                if growth_prev != 0:
                    accel.append(growth_curr / growth_prev)
        
        avg_accel = sum(accel) / len(accel) if accel else 0
        accelerations.append(avg_accel)
    
    return accelerations

def analyze_high_order_behavior(max_n=20, num_primes=100):
    """
    Анализ поведения на высоких порядках
    """
    print(f"Анализ для max_n={max_n}, num_primes={num_primes}")
    
    series = compute_multiple_levels(max_n, num_primes)
    
    # Анализ роста
    growth_analysis = analyze_growth(series)
    print("\nАнализ роста (средние отношения L_n / L_{n-1}):")
    for level, data in growth_analysis.items():
        print(f"L_{level}: среднее отношение = {data['avg_ratio']:.4f}, последнее = {data['last_ratio']:.4f}")
    
    # Константа ускорения
    accelerations = find_acceleration_constant(series, max_n)
    print("\nКонстанты ускорения (отношения скоростей роста):")
    for i, accel in enumerate(accelerations, 2):
        print(f"Уровень {i}: {accel:.4f}")
    
    # Проверка на стабилизацию
    if accelerations:
        last_accels = accelerations[-5:]  # последние 5
        avg_last = sum(last_accels) / len(last_accels)
        print(f"\nСредняя константа ускорения на высоких уровнях: {avg_last:.4f}")
    
    return series, growth_analysis, accelerations

if __name__ == "__main__":
    # Запуск анализа
    series, growth, accels = analyze_high_order_behavior(max_n=10, num_primes=50)