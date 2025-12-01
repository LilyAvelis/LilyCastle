"""
Lily Series Computation
Вычисление рядов Лилии L_n путем многократного кумулятивного суммирования
"""

from data_primes import generate_n_primes
import sys

def cumulative_sum(series):
    """Вычисление кумулятивной суммы ряда"""
    cumsum = []
    total = 0
    for num in series:
        total += num
        cumsum.append(total)
    return cumsum

def compute_lily_series(n, num_primes=1000):
    """
    Вычисление L_n - n-кратная кумулятивная сумма простых чисел
    n: порядок интеграции
    num_primes: количество простых чисел для базового ряда
    """
    # Базовый ряд L0
    L0 = generate_n_primes(num_primes)
    current = L0
    
    # Применяем кумулятивное суммирование n раз
    for i in range(n):
        current = cumulative_sum(current)
        print(f"L_{i+1} первые 10: {current[:10]}")
    
    return current

def compute_multiple_levels(max_n, num_primes=100):
    """
    Вычисление нескольких уровней L_0 до L_max_n
    Возвращает словарь с рядами
    """
    series = {}
    L0 = generate_n_primes(num_primes)
    series[0] = L0
    current = L0
    
    for i in range(1, max_n + 1):
        current = cumulative_sum(current)
        series[i] = current
    
    return series

if __name__ == "__main__":
    # Пример: вычислить L_5 для первых 20 простых
    series = compute_multiple_levels(5, 20)
    for level, values in series.items():
        print(f"L_{level}: {values}")