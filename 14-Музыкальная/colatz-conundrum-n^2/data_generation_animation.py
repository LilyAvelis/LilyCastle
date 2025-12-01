import numpy as np
import pickle
from tqdm import tqdm
import concurrent.futures
from functools import partial
import numba

@numba.jit(nopython=True)
def simulate(n, a, b, c, max_steps=10000, max_value=1e12):
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

def generate_animation_data(c_values, a_range=(-2, 2), b_range=(-10, 10), n_starts=50, max_steps=10000, max_value=1e12, output_file='data_animation.pkl'):
    a_vals = np.linspace(a_range[0], a_range[1], 100)  # 100 points
    b_vals = np.linspace(b_range[0], b_range[1], 100)
    n_vals = np.arange(1, n_starts + 1)

    data_frames = {}
    for c in tqdm(c_values, desc="Generating frames"):
        tasks = [(a, b, c, n_vals, max_steps, max_value) for a in a_vals for b in b_vals]
        with concurrent.futures.ProcessPoolExecutor(max_workers=16) as executor:
            results = list(executor.map(wrapper, tasks))
        data = np.array(results).reshape((len(a_vals), len(b_vals)))
        data_frames[c] = data

    with open(output_file, 'wb') as f:
        pickle.dump({'a_vals': a_vals, 'b_vals': b_vals, 'c_values': c_values, 'data_frames': data_frames}, f)

    print(f"Animation data saved to {output_file}")

if __name__ == "__main__":
    c_values = np.arange(0.4, 0.61, 0.05)  # 0.4, 0.45, 0.5, 0.55, 0.6
    generate_animation_data(c_values)