from analysis_classification import generate_phase_data
from visualization_phase_map import plot_phase_map
import numpy as np

# Parameters for deeper analysis
a_range = np.linspace(-5, 5, 200)  # 200 points from -5 to 5
b_range = np.linspace(-20, 10, 200)  # 200 points from -20 to 10
n_starts = list(range(1, 1001))  # adjusted to 1-1000 for reasonable speed
max_steps = 5000  # increased steps
max_value = 1e9  # increased max_value by 2 orders
num_processes = 32  # for Ryzen 9950X with hyperthreading

if __name__ == '__main__':
    print("Generating phase data...")
    data = generate_phase_data(a_range, b_range, n_starts, max_steps, max_value, num_processes)
    print("Plotting phase map...")
    plot_phase_map(data, a_range, b_range, '1graph_phase_map.png')
    print("Done. Check 1graph_phase_map.png")