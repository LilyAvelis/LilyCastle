import pickle
import numpy as np

def verify_data():
    print("Loading data_grid_3d.pkl...")
    try:
        with open('data_grid_3d.pkl', 'rb') as f:
            data_dict = pickle.load(f)
    except FileNotFoundError:
        print("Error: data_grid_3d.pkl not found.")
        return

    a_vals = data_dict['a_vals']
    b_vals = data_dict['b_vals']
    c_vals = data_dict['c_vals']
    data = data_dict['data']

    print(f"Data shape: {data.shape}")
    print(f"a range: [{a_vals.min()}, {a_vals.max()}]")
    print(f"b range: [{b_vals.min()}, {b_vals.max()}]")
    print(f"c range: [{c_vals.min()}, {c_vals.max()}]")

    min_val = np.min(data)
    max_val = np.max(data)
    mean_val = np.mean(data)

    print(f"Min value (metric): {min_val}")
    print(f"Max value (metric): {max_val}")
    print(f"Mean value (metric): {mean_val}")

    # Find location of minimum
    min_indices = np.unravel_index(np.argmin(data), data.shape)
    min_a = a_vals[min_indices[0]]
    min_b = b_vals[min_indices[1]]
    min_c = c_vals[min_indices[2]]

    print(f"Global Minimum found at indices: {min_indices}")
    print(f"Coordinates: a={min_a:.4f}, b={min_b:.4f}, c={min_c:.4f}")

    # Check center
    center_a_idx = np.argmin(np.abs(a_vals - 0))
    center_b_idx = np.argmin(np.abs(b_vals - 0))
    center_c_idx = np.argmin(np.abs(c_vals - 0))
    
    center_val = data[center_a_idx, center_b_idx, center_c_idx]
    print(f"Value at center (approx a=0, b=0, c=0): {center_val}")

    # Check if minimum is on the boundary
    on_boundary = (
        min_indices[0] == 0 or min_indices[0] == len(a_vals) - 1 or
        min_indices[1] == 0 or min_indices[1] == len(b_vals) - 1 or
        min_indices[2] == 0 or min_indices[2] == len(c_vals) - 1
    )
    print(f"Is minimum on boundary? {on_boundary}")

    # Percentiles
    percentiles = [0, 10, 25, 50, 75, 90, 95, 99, 100]
    p_vals = np.percentile(data, percentiles)
    print("Percentiles:")
    for p, val in zip(percentiles, p_vals):
        print(f"{p}%: {val:.4f}")

    # Check if center is high or low relative to distribution
    if center_val > p_vals[4]: # Median
        print("Center is in the upper half (slower convergence/divergence).")
    else:
        print("Center is in the lower half (faster convergence).")

if __name__ == "__main__":
    verify_data()
