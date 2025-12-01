from analysis_classification import generate_phase_data
from visualization_phase_map import plot_phase_map
import numpy as np

# Zoom into the boundary region for b < 0 rays analysis
a_range = np.linspace(-2, 2, 200)  # Include positive a for comparison
b_range = np.linspace(-20, 0, 200)  # Focus on negative b for rays
n_starts = list(range(1, 201))
max_steps = 2000
max_value = 1e7
num_processes = 32

if __name__ == '__main__':
    print("Generating zoomed phase data for b < 0 rays analysis...")
    data = generate_phase_data(a_range, b_range, n_starts, max_steps, max_value, num_processes)
    print("Plotting zoomed phase map for b < 0...")
    plot_phase_map(data, a_range, b_range, '1graph_rays_b_negative.png')
    print("Done. Check 1graph_rays_b_negative.png")