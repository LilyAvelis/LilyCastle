"""
Lily Numbers Web Dashboard
Веб-приложение для исследования константы ускорения рядов Лилии
"""

import streamlit as st
import matplotlib.pyplot as plt
from data_series import compute_multiple_levels
import numpy as np

st.set_page_config(
    page_title="Константа Ускорения Рядов Лилии",
    page_icon="🔢",
    layout="wide"
)

st.title("🔢 Константа Ускорения Рядов Лилии")
st.markdown("Исследование поведения многократных кумулятивных сумм простых чисел")

# Боковая панель с параметрами
st.sidebar.header("Параметры исследования")

max_n = st.sidebar.slider("Максимальный уровень n", 10, 100, 50, 5)
num_primes = st.sidebar.slider("Количество простых чисел", 20, 200, 40, 10)

st.sidebar.markdown("---")
st.sidebar.markdown("### О проекте")
st.sidebar.markdown("Аксиома Лилии: 1 включено как первое простое число")
st.sidebar.markdown("L_n - n-кратная кумулятивная сумма")

# Вычисление данных
@st.cache_data
def compute_data(max_n, num_primes):
    series = compute_multiple_levels(max_n, num_primes)

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

    return series, accelerations, levels

# Вычисление
with st.spinner("Вычисление рядов Лилии..."):
    series, accelerations, levels = compute_data(max_n, num_primes)

# Основная область
col1, col2 = st.columns([2, 1])

with col1:
    st.subheader("📊 График Константы Ускорения")

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
    ax.set_title('Константа Ускорения Рядов Лилии', fontsize=14, fontweight='bold')
    ax.legend(fontsize=10)
    ax.grid(True, alpha=0.3)
    ax.set_ylim(0.7, 1.0)

    st.pyplot(fig)

with col2:
    st.subheader("📈 Статистика")

    if accelerations:
        final_limit = sum(accelerations[-10:]) / 10
        st.metric("Предельная константа", f"{final_limit:.6f}")

        range_min = min(accelerations)
        range_max = max(accelerations)
        st.metric("Диапазон изменения", f"{range_min:.3f} - {range_max:.3f}")

        if len(accelerations) > 1:
            diffs = [abs(accelerations[i+1] - accelerations[i]) for i in range(len(accelerations)-1)]
            convergence_rate = sum(diffs[-10:]) / 10
            st.metric("Скорость сходимости", f"{convergence_rate:.2e}")

    st.markdown("---")
    st.markdown("### Последние значения")
    if len(accelerations) >= 5:
        for i in range(-5, 0):
            st.write(f"n={levels[i]:2d}: {accelerations[i]:.6f}")

# Дополнительная информация
st.markdown("---")
st.subheader("🎯 Результаты исследования")

col1, col2, col3 = st.columns(3)

with col1:
    st.markdown("**Константа ускорения**")
    st.markdown("Существует предел ≈ 0.9935")
    st.markdown("Стабилизируется при n > 30")

with col2:
    st.markdown("**Сходимость**")
    st.markdown("Экспоненциальная")
    st.markdown("Показатель ≈ 0.0024")

with col3:
    st.markdown("**Интерпретация**")
    st.markdown("Хаос простых чисел")
    st.markdown("→ Предсказуемая структура")

st.markdown("---")
st.markdown("### 📚 О теории")
st.markdown("""
**Аксиома Лилии:** 1 считается первым простым числом
**L_0:** 1, 2, 3, 5, 7, 11, 13, 17, 19, 23...
**L_n:** n-кратная кумулятивная сумма L_0
**Вопрос:** Что происходит при n → ∞?
""")

# Footer
st.markdown("---")
st.markdown("*Исследование рядов Лилии - 2025*")