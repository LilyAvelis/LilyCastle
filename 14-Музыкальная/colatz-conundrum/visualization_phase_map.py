import matplotlib.pyplot as plt
import numpy as np

def plot_phase_map(data, a_range, b_range, save_path='1graph_phase_map.png'):
    """
    Plot the phase map with continuous colormap based on average steps.
    """
    a_vals = sorted(set(a for a, b in data.keys()))
    b_vals = sorted(set(b for a, b in data.keys()))

    grid = np.zeros((len(b_vals), len(a_vals)))

    for (a, b), val in data.items():
        i = a_vals.index(a)
        j = b_vals.index(b)
        grid[j, i] = val

    plt.figure(figsize=(12, 10), dpi=300)  # high resolution
    plt.imshow(grid, origin='lower', extent=[min(a_vals), max(a_vals), min(b_vals), max(b_vals)], cmap='plasma', aspect='auto')
    plt.colorbar(label='Average Steps to Divergence')
    plt.xlabel('a')
    plt.ylabel('b')
    plt.title('Fractal Phase Map for Generalized Collatz (a*n + b if odd, n/2 if even)')
    plt.savefig(save_path, dpi=300)
    plt.close()  # don't show, since automated