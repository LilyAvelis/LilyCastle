"""
Data generation module for Collatz polynomial iterations.

Generates parameter grids and computes trajectories for analysis.
Optimized with Numba for parallel processing on multi-core Ryzen 9950X.
"""

import numpy as np
from numba import jit, prange
from helper_utils import (
    collatz_polynomial_step,
    simulate_trajectory,
    batch_simulate_trajectories,
    generate_parameter_grid,
    save_data,
    log_message
)


def generate_coefficient_ranges(degree, default_range=(-2, 2)):
    """
    Generate default ranges for polynomial coefficients.

    Parameters:
    - degree: polynomial degree d
    - default_range: (min, max) for each coefficient

    Returns:
    - ranges: list of (min, max) tuples
    """
    return [default_range] * (degree + 1)


@jit(nopython=True, parallel=True)
def compute_convergence_grid(coeff_grid, start_range, max_steps=1000, max_value=10**18):
    """
    Compute convergence statistics for a grid of coefficients.

    Parameters:
    - coeff_grid: 2D array of coefficients (num_coeffs, degree+1)
    - start_range: range of starting numbers (min, max, num_samples)
    - max_steps, max_value: simulation parameters

    Returns:
    - convergence_data: array of shape (num_coeffs, num_starts, 2)
                       where [:, :, 0] is trajectory length, [:, :, 1] is converged flag
    """
    starts = np.arange(start_range[0], start_range[1], (start_range[1] - start_range[0]) // start_range[2])
    num_coeffs, degree_plus_1 = coeff_grid.shape
    num_starts = len(starts)

    results = np.zeros((num_coeffs, num_starts, 2), dtype=np.int64)

    for i in prange(num_coeffs):
        coeffs = coeff_grid[i]
        batch_results = batch_simulate_trajectories(starts, coeffs, max_steps, max_value)
        results[i] = batch_results

    return results


def generate_and_save_data(degree, num_points=50, start_range=(1, 1000, 100),
                          max_steps=1000, max_value=10**18, output_prefix='data'):
    """
    Generate parameter grid and compute convergence data, then save to files.

    Parameters:
    - degree: polynomial degree
    - num_points: number of grid points per coefficient
    - start_range: (min_start, max_start, num_samples)
    - max_steps, max_value: simulation limits
    - output_prefix: prefix for output files
    """
    log_message(f"Generating data for degree {degree}")

    # Generate coefficient ranges and grid
    ranges = generate_coefficient_ranges(degree)
    coeff_grid = generate_parameter_grid(ranges, num_points)

    log_message(f"Generated {coeff_grid.shape[0]} parameter combinations")

    # Compute convergence data
    convergence_data = compute_convergence_grid(coeff_grid, start_range, max_steps, max_value)

    # Save data
    coeff_filename = f"{output_prefix}_coeffs_degree_{degree}.npy"
    data_filename = f"{output_prefix}_convergence_degree_{degree}.npy"

    save_data(coeff_grid, coeff_filename)
    save_data(convergence_data, data_filename)

    log_message(f"Data saved to {coeff_filename} and {data_filename}")

    return coeff_grid, convergence_data


if __name__ == "__main__":
    # Example usage for degree 1 (linear)
    generate_and_save_data(1, num_points=20, start_range=(1, 100, 50))

    # Example for degree 2 (quadratic)
    generate_and_save_data(2, num_points=10, start_range=(1, 100, 50))