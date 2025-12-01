import numpy as np
from data_generation import classify_ab
from multiprocessing import Pool
import tqdm

def generate_phase_data(a_range, b_range, n_starts, max_steps=1000, max_value=1e6, num_processes=8):
    """
    Generate phase data for grid of a, b.
    Returns: dict with (a,b) -> average steps
    """
    data = {}
    tasks = [(a, b, n_starts, max_steps, max_value) for a in a_range for b in b_range]

    with Pool(num_processes) as pool:
        results = list(tqdm.tqdm(pool.imap(process_task, tasks), total=len(tasks)))

    for (a, b), avg_steps in results:
        data[(a, b)] = avg_steps
    return data

def process_task(args):
    a, b, n_starts, max_steps, max_value = args
    avg_steps = classify_ab(a, b, n_starts, max_steps, max_value)
    return (a, b), avg_steps