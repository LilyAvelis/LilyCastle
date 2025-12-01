"""
Helper utilities for Collatz-like polynomial iterations.

This module contains common functions and utilities used across the project.
Includes Numba-compiled functions for performance optimization on Ryzen 9950X.
"""

import numpy as np
from numba import jit, prange
import time


@jit(nopython=True)
def collatz_polynomial_step(n, coeffs):
    """
    Perform one step of the polynomial Collatz iteration.

    Parameters:
    - n: current number (int)
    - coeffs: array of polynomial coefficients [k_d, k_{d-1}, ..., k_0]

    Returns:
    - next_n: next number after iteration
    """
    if n % 2 == 0:
        return n // 2
    else:
        # Compute P(n) = sum(coeffs[i] * n^(len(coeffs)-1-i))
        degree = len(coeffs) - 1
        result = 0
        for i in range(len(coeffs)):
            result += coeffs[i] * (n ** (degree - i))
        return int(result)


@jit(nopython=True)
def simulate_trajectory(n_start, coeffs, max_steps=1000, max_value=10**18):
    """
    Simulate a single trajectory from n_start.

    Parameters:
    - n_start: starting number
    - coeffs: polynomial coefficients
    - max_steps: maximum number of steps
    - max_value: maximum allowed value before stopping

    Returns:
    - trajectory: list of numbers in the trajectory
    - converged: True if reached 1 or cycle, False if diverged
    """
    trajectory = [n_start]
    n = n_start
    for _ in range(max_steps):
        n = collatz_polynomial_step(n, coeffs)
        trajectory.append(n)
        if n == 1:
            return trajectory, True
        if abs(n) > max_value:
            return trajectory, False
    return trajectory, False


@jit(nopython=True, parallel=True)
def batch_simulate_trajectories(starts, coeffs, max_steps=1000, max_value=10**18):
    """
    Simulate multiple trajectories in parallel.

    Parameters:
    - starts: array of starting numbers
    - coeffs: polynomial coefficients
    - max_steps, max_value: as above

    Returns:
    - results: array of (length, converged) for each trajectory
    """
    results = np.zeros((len(starts), 2), dtype=np.int64)
    for i in prange(len(starts)):
        traj, conv = simulate_trajectory(starts[i], coeffs, max_steps, max_value)
        results[i, 0] = len(traj)
        results[i, 1] = int(conv)
    return results


def generate_parameter_grid(coeff_ranges, num_points):
    """
    Generate a grid of parameter combinations.

    Parameters:
    - coeff_ranges: list of (min, max) for each coefficient
    - num_points: number of points per dimension

    Returns:
    - grid: 2D numpy array of shape (total_combinations, num_coeffs)
    """
    axes = [np.linspace(r[0], r[1], num_points) for r in coeff_ranges]
    mesh = np.meshgrid(*axes, indexing='ij')
    grid = np.stack(mesh, axis=-1).reshape(-1, len(coeff_ranges))
    return grid


def save_data(data, filename):
    """
    Save data to a numpy file.

    Parameters:
    - data: data to save
    - filename: output filename
    """
    np.save(filename, data)


def load_data(filename):
    """
    Load data from a numpy file.

    Parameters:
    - filename: input filename

    Returns:
    - loaded data
    """
    return np.load(filename)


def log_message(message, level='INFO'):
    """
    Simple logging function.

    Parameters:
    - message: message to log
    - level: log level
    """
    timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
    print(f'[{timestamp}] {level}: {message}')