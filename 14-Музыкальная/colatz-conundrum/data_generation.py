import numpy as np
from numba import jit

@jit(nopython=True)
def simulate_orbit(n_start, a, b, max_steps=1000, max_value=1e6):
    """
    Simulate the orbit for given n_start, a, b.
    Returns: number of steps until divergence or max_steps
    """
    n = float(n_start)
    for step in range(max_steps):
        if n > max_value:
            return step
        if abs(n) < 1e-10:  # avoid division by zero or very small
            return step
        if abs(n % 2) < 1e-10:  # even
            n = n / 2
        else:
            n = a * n + b
    return max_steps

def classify_ab(a, b, n_starts, max_steps=1000, max_value=1e6):
    """
    Classify behavior for given a, b by testing multiple n_starts.
    Returns: average log(steps + 1) for finer scale in divergence regions
    """
    steps = []
    for n in n_starts:
        step = simulate_orbit(n, a, b, max_steps, max_value)
        steps.append(step)
    # Use log scale for finer granularity in fast divergence regions
    log_steps = [np.log(s + 1) for s in steps]
    return np.mean(log_steps)