import numpy as np
from data_generation import simulate_orbit
import matplotlib.pyplot as plt

def analyze_control_slices(a_values, n_range, max_steps=5000, max_value=1e9):
    """
    Analyze control slices for fixed a values in divergence regions.
    For each a, test large range of n_starts, collect trajectory lengths and maxima.
    """
    results = {}

    for a in a_values:
        print(f"Analyzing a = {a}")
        lengths = []
        maxima = []

        for n in n_range:
            # Simulate with b=0 for simplicity, or vary b? Wait, @Home says for fixed a, vary n
            # But in divergence regions, b affects, but for simplicity, use b=0 or typical
            # Actually, @Home: "для фиксированных a в зоне быстрой смерти, например: a = -2, -3, -4"
            # And "прогоняй большой диапазон стартовых x0", so for each a, vary x0 = n, and perhaps fixed b?
            # But to show no long-lived islands, vary n, and see if all diverge quickly.
            # Use b=0 for simplicity.

            b = 0  # fixed b for slices
            step = simulate_orbit(n, a, b, max_steps, max_value)
            lengths.append(step)

            # To get maximum, need full trajectory
            # Modify to collect max
            n_val = float(n)
            max_val = n_val
            for s in range(max_steps):
                if n_val > max_value:
                    break
                if abs(n_val) < 1e-10:
                    break
                if abs(n_val % 2) < 1e-10:
                    n_val = n_val / 2
                else:
                    n_val = a * n_val + b
                max_val = max(max_val, abs(n_val))
            maxima.append(max_val)

        results[a] = {'lengths': lengths, 'maxima': maxima}

    return results

def plot_control_slices(results, n_range):
    """Plot distributions of trajectory lengths and maxima"""
    fig, axes = plt.subplots(len(results), 2, figsize=(12, 6 * len(results)))

    if len(results) == 1:
        axes = [axes]

    for i, (a, data) in enumerate(results.items()):
        # Trajectory lengths
        axes[i][0].hist(data['lengths'], bins=50, alpha=0.7, color='blue')
        axes[i][0].set_xlabel('Trajectory Length')
        axes[i][0].set_ylabel('Frequency')
        axes[i][0].set_title(f'Trajectory Lengths for a={a}')
        axes[i][0].set_yscale('log')

        # Maxima
        axes[i][1].hist(data['maxima'], bins=50, alpha=0.7, color='red')
        axes[i][1].set_xlabel('Maximum Value')
        axes[i][1].set_ylabel('Frequency')
        axes[i][1].set_title(f'Maxima for a={a}')
        axes[i][1].set_yscale('log')

    plt.tight_layout()
    plt.savefig('1graph_control_slices_analysis.png', dpi=300)
    plt.close()

if __name__ == '__main__':
    # Control slices for a in divergence regions
    a_values = [-4, -3, -2]
    n_range = list(range(1, 5001))  # 1 to 5000 for reasonable time

    results = analyze_control_slices(a_values, n_range)
    plot_control_slices(results, n_range)
    print("Control slices analysis complete. Check 1graph_control_slices_analysis.png")