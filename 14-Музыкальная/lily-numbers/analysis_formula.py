"""
Formula Investigation
Исследование асимптотической формулы A(k) ≈ 1 - 0.003526 / k^(-0.1301)
"""

import math

def asymptotic_formula(k):
    """
    Асимптотическая формула A(k) ≈ 1 - 0.003526 / k^(-0.1301)
    """
    c = 0.003526
    a = -0.1301  # Обратите внимание: отрицательный показатель степени
    return 1 - c * (k ** a)

def investigate_formula():
    """
    Исследование формулы: сравнение с экспериментальными данными
    """
    print("🔬 ИССЛЕДОВАНИЕ АСИМПТОТИЧЕСКОЙ ФОРМУЛЫ")
    print("=" * 60)

    # Экспериментальные данные
    experimental_data = [
        (50, 0.995044),
        (80, 0.993403),
        (100, 0.992569),
        (150, 0.991024),
        (200, 0.994876),
    ]

    print("Сравнение формулы с экспериментальными данными:")
    print("k\t\tЭксперимент\tФормула\t\tОшибка")
    print("-" * 50)

    total_error = 0
    for k, exp_val in experimental_data:
        formula_val = asymptotic_formula(k)
        error = abs(formula_val - exp_val)
        total_error += error
        print(f"{k}\t\t{exp_val:.8f}\t\t{formula_val:.8f}\t\t{error:.6f}")

    avg_error = total_error / len(experimental_data)
    print(f"\nСредняя ошибка аппроксимации: {avg_error:.6f}")

    # Исследование поведения формулы
    print("\n📈 ПОВЕДЕНИЕ ФОРМУЛЫ:")
    print("k\t\tA(k)\t\tОтклонение от 1")
    print("-" * 40)

    test_k_values = [10, 50, 100, 200, 500, 1000, 2000, 5000, 10000]
    for k in test_k_values:
        val = asymptotic_formula(k)
        deviation = 1 - val
        print(f"{k}\t\t{val:.8f}\t\t{deviation:.2e}")

    # Анализ параметров формулы
    print("\n🔍 АНАЛИЗ ПАРАМЕТРОВ:")
    c = 0.003526
    a = -0.1301

    print(f"c = {c:.6f}")
    print(f"a = {a:.4f}")
    print(f"Показатель степени: {abs(a):.4f} (медленная сходимость)")

    # Что означает показатель степени a = -0.1301?
    print("\n💡 ИНТЕРПРЕТАЦИЯ ПОКАЗАТЕЛЯ СТЕПЕНИ:")
    print("Показатель степени a = -0.1301 означает:")
    print("- Отклонение уменьшается очень медленно при росте k")
    print("- Для больших k: A(k) ≈ 1 - c*k^a ≈ 1 - c/sqrt(k^0.1301)")
    print("- Это соответствует гиперболической сходимости")

    # Проверка на рациональность параметров
    print("\n🔢 РАЦИОНАЛЬНЫЕ ПРИБЛИЖЕНИЯ ПАРАМЕТРОВ:")
    print(f"c = {c:.6f}")
    print(f"a = {a:.4f}")

    # Попытка найти рациональные приближения
    def find_rational_approx(x, max_denom=1000):
        best_num, best_denom = 1, 1
        best_error = abs(x - 1)

        for denom in range(1, max_denom + 1):
            num = round(x * denom)
            error = abs(x - num/denom)
            if error < best_error:
                best_error = error
                best_num, best_denom = num, denom

        return best_num, best_denom, best_error

    c_num, c_denom, c_error = find_rational_approx(c, 10000)
    a_num, a_denom, a_error = find_rational_approx(abs(a), 10000)  # abs(a) для положительного

    print(f"c ≈ {c_num}/{c_denom} (ошибка: {c_error:.2e})")
    print(f"a ≈ -{a_num}/{a_denom} (ошибка: {a_error:.2e})")

def extended_analysis():
    """
    Расширенный анализ формулы для очень больших k
    """
    print("\n🚀 РАСШИРЕННЫЙ АНАЛИЗ (большие k):")
    print("k\t\tA(k)\t\tОтклонение\t\tСкорость сходимости")
    print("-" * 70)

    prev_deviation = 1 - asymptotic_formula(1000)
    for k in [5000, 10000, 50000, 100000, 500000, 1000000]:
        val = asymptotic_formula(k)
        deviation = 1 - val
        convergence_rate = prev_deviation / deviation if deviation > 0 else float('inf')
        print(f"{k}\t\t{val:.8f}\t\t{deviation:.2e}\t\t{convergence_rate:.2f}")
        prev_deviation = deviation

if __name__ == "__main__":
    investigate_formula()
    extended_analysis()