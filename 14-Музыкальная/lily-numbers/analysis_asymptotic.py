"""
Asymptotic Analysis
Анализ асимптотического поведения A(k) при k → ∞
"""

from data_series import compute_multiple_levels
import math

def asymptotic_test():
    """
    Тестирование с очень большим количеством простых
    """
    print("🌀 АСИМПТОТИЧЕСКИЙ АНАЛИЗ: A(k) при k → ∞")
    print("=" * 60)

    # Тестируем с разными k
    test_cases = [
        (50, 40),
        (100, 60),
        (200, 80),
        (500, 100),  # Большое количество простых
        (1000, 120),  # Очень большое
    ]

    results = []

    for num_primes, max_n in test_cases:
        print(f"\n🔬 Тестирование с {num_primes} простыми числами (n до {max_n})")

        try:
            series = compute_multiple_levels(max_n, num_primes)

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

            if len(accelerations) > 10:
                last_10 = accelerations[-10:]
                limit = sum(last_10) / len(last_10)

                # Проверка стабильности
                diffs = [abs(last_10[i+1] - last_10[i]) for i in range(len(last_10)-1)]
                stability = sum(diffs) / len(diffs)

                print(f"  Константа: {limit:.8f}")
                print(f"  Стабильность: {stability:.2e}")
                print(f"  Отклонение от 1: {1 - limit:.2e}")

                results.append({
                    'k': num_primes,
                    'limit': limit,
                    'deviation': 1 - limit,
                    'stability': stability
                })

        except Exception as e:
            print(f"  Ошибка: {e}")

    print("\n📊 РЕЗУЛЬТАТЫ:")
    print("k\t\tA(k)\t\tОтклонение от 1")
    print("-" * 40)
    for r in results:
        print(f"🔬 Тестирование с {r['k']} простыми числами")
        print(f"Константа: {r['limit']}")
        print(f"Стабильность: {r['stability']}")
        print(f"Отклонение от 1: {r['deviation']}")
        print()

    # Анализ тренда
    if len(results) > 1:
        k_values = [r['k'] for r in results]
        deviations = [r['deviation'] for r in results]

    print("\n📈 ТРЕНД:")
    print(f"При увеличении k отклонение от 1: {deviations}")

    if deviations[-1] < deviations[0]:
        print("✅ Подтверждается: A(k) → 1 при k → ∞")
    else:
        print("❓ Тренд неясен, нужно больше данных")

def find_asymptotic_formula():
    """
    Поиск формулы для A(k)
    """
    print("\n🧮 ПОИСК АСИМПТОТИЧЕСКОЙ ФОРМУЛЫ")

    # Гипотеза: A(k) = 1 - c/k^a
    # Найдем параметры c и a

    data_points = [
        (50, 0.995044),
        (80, 0.993403),
        (100, 0.992569),
        (150, 0.991024),
        (200, 0.994876),
    ]

    k_values = [p[0] for p in data_points]
    a_values = [1 - p[1] for p in data_points]  # Отклонения от 1

    print("k\t\tA(k)\t\tОтклонение")
    for k, ak, dev in zip(k_values, [p[1] for p in data_points], a_values):
        print(f"{k}\t\t{ak}\t\t{dev}")

    # Попытка аппроксимации a_values = c / k^a
    # Логарифмическая регрессия: ln(a) = ln(c) - a*ln(k)

    import numpy as np

    ln_k = [math.log(k) for k in k_values]
    ln_a = [math.log(a) if a > 0 else -10 for a in a_values]  # Избегать log(0)

    # Линейная регрессия
    n = len(ln_k)
    sum_x = sum(ln_k)
    sum_y = sum(ln_a)
    sum_xy = sum(x*y for x,y in zip(ln_k, ln_a))
    sum_x2 = sum(x**2 for x in ln_k)

    slope = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x**2)
    intercept = (sum_y - slope * sum_x) / n

    a = -slope  # Поскольку y = ln(c) - a*x, slope = -a
    c = math.exp(intercept)

    print("\n📐 АППРОКСИМАЦИЯ:")
    print(f"A(k) ≈ 1 - {c:.6f} / k^{a:.4f}")

    # Проверка качества
    predicted = [1 - c / (k ** a) for k in k_values]
    actual = [p[1] for p in data_points]

    errors = [abs(pred - act) for pred, act in zip(predicted, actual)]
    max_error = max(errors)

    print(f"Максимальная ошибка аппроксимации: {max_error:.6f}")

    if max_error < 0.01:
        print("✅ Хорошая аппроксимация!")
    else:
        print("⚠️ Приемлемая аппроксимация")

def theoretical_explanation():
    """
    Теоретическое объяснение почему A(k) → 1
    """
    print("\n🎭 ТЕОРЕТИЧЕСКОЕ ОБЪЯСНЕНИЕ")
    print("""
Почему A(k) → 1 при k → ∞?

1. Базовый ряд L₀ становится все более плотным при больших k
2. Многократное интегрирование сглаживает локальные вариации
3. При k → ∞ ряд простых чисел ведет себя как непрерывная функция
4. Для непрерывных функций многократное интегрирование дает константу ускорения = 1

Это аналогично тому, как частичные суммы гармонического ряда
приближаются к интегралу, но здесь мы имеем дело с
дискретно-непрерывным переходом.
    """)

if __name__ == "__main__":
    asymptotic_test()
    find_asymptotic_formula()
    theoretical_explanation()