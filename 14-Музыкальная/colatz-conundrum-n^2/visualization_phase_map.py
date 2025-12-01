import numpy as np
import pickle
import matplotlib.pyplot as plt

def plot_phase_map(data_file, output_image='1graph_phase_map.png'):
    """
    Load data from pickle and plot the phase map.
    """
    with open(data_file, 'rb') as f:
        data_dict = pickle.load(f)

    a_vals = data_dict['a_vals']
    b_vals = data_dict['b_vals']
    c = data_dict['c']
    data = data_dict['data']

    plt.figure(figsize=(10, 8))
    plt.imshow(data, extent=[b_vals.min(), b_vals.max(), a_vals.min(), a_vals.max()],
               origin='lower', cmap='viridis', aspect='auto')
    plt.colorbar(label='Average log(steps + 1)')
    plt.xlabel('b')
    plt.ylabel('a')
    plt.title(f'Phase Map for Quadratic Collatz (c={c})')
    plt.savefig(output_image, dpi=300)
    plt.show()
    print(f"Plot saved to {output_image}")

if __name__ == "__main__":
    plot_phase_map('data_grid.pkl')