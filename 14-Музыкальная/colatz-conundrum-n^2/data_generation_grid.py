import numpy as np
import pickle
from tqdm import tqdm
import concurrent.futures
from functools import partial
import numba

@numba.jit(nopython=True)
def simulate(n, a, b, c, max_steps=2000, max_value=1e7):
    """
    Simulate the quadratic Collatz dynamics for a given n, a, b, c.
    Returns the number of steps until n exceeds max_value or max_steps is reached.
    """
    steps = 0
    while steps < max_steps and abs(n) < max_value:
        if n % 2 == 0:
            n = n / 2
        else:
            n = a * n**2 + b * n + c
        steps += 1
    return steps

def compute_avg(a, b, c, n_vals, max_steps, max_value):
    steps_list = [simulate(n, a, b, c, max_steps, max_value) for n in n_vals]
    return np.mean(np.log(np.array(steps_list) + 1))

def wrapper(task):
    return compute_avg(*task)

def generate_grid_data(a_range, b_range, c_fixed, n_starts, max_steps=2000, max_value=1e7, output_file='data_grid.pkl'):
    """
    Generate phase map data for fixed c, varying a and b.
    For each (a,b), compute average log(steps + 1) over n_starts.
    """
    a_vals = np.linspace(a_range[0], a_range[1], 200)  # 200 points for a
    b_vals = np.linspace(b_range[0], b_range[1], 200)  # 200 points for b
    n_vals = np.arange(1, n_starts + 1)  # n from 1 to n_starts

    tasks = [(a, b, c_fixed, n_vals, max_steps, max_value) for a in a_vals for b in b_vals]

    with concurrent.futures.ProcessPoolExecutor(max_workers=16) as executor:
        results = list(tqdm(executor.map(wrapper, tasks), total=len(tasks)))

    data = np.array(results).reshape((len(a_vals), len(b_vals)))

    # Save data
    with open(output_file, 'wb') as f:
        pickle.dump({'a_vals': a_vals, 'b_vals': b_vals, 'c': c_fixed, 'data': data}, f)

    print(f"Data saved to {output_file}")

def generate_3d_grid_data(a_range, b_range, c_range, n_starts, max_steps=10000, max_value=1e12, output_file='data_grid_3d.pkl'):
    """
    Generate 3D phase map data for varying a, b, c.
    For each (a,b,c), compute average log(steps + 1) over n_starts.
    """
    a_vals = np.linspace(a_range[0], a_range[1], 50)  # 50 points for a
    b_vals = np.linspace(b_range[0], b_range[1], 50)  # 50 points for b
    c_vals = np.linspace(c_range[0], c_range[1], 50)  # 50 points for c
    n_vals = np.arange(1, n_starts + 1)  # n from 1 to n_starts

    tasks = [(a, b, c, n_vals, max_steps, max_value) for a in a_vals for b in b_vals for c in c_vals]

    with concurrent.futures.ProcessPoolExecutor(max_workers=16) as executor:
        results = list(tqdm(executor.map(wrapper, tasks), total=len(tasks)))

    # Reshape to 3D array
    data = np.array(results).reshape((len(a_vals), len(b_vals), len(c_vals)))

    # Save data
    with open(output_file, 'wb') as f:
        pickle.dump({'a_vals': a_vals, 'b_vals': b_vals, 'c_vals': c_vals, 'data': data}, f)

    print(f"3D data saved to {output_file}")

if __name__ == "__main__":
    # 2D grid for c=0.5, high resolution
    generate_grid_data(a_range=(-2, 2), b_range=(-10, 10), c_fixed=0.5, n_starts=100, output_file='data_grid_c05.pkl')

    # 3D grid for full c range
    generate_3d_grid_data(a_range=(-2, 2), b_range=(-10, 10), c_range=(-20, 20), n_starts=100, output_file='data_grid_3d.pkl')