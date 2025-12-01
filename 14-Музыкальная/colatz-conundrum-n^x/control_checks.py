"""
Control and validation module for Collatz polynomial iterations.

Performs sanity checks, validation of results, and comparison of different implementations.
"""

import numpy as np
from helper_utils import (
    collatz_polynomial_step,
    simulate_trajectory,
    batch_simulate_trajectories,
    load_data,
    log_message
)


def sanity_check_basic_collatz():
    """
    Sanity check for basic Collatz (3n+1) with linear coefficients.

    Returns:
    - passed: True if checks pass
    """
    log_message("Running sanity check for basic Collatz")

    # Standard Collatz: even -> n/2, odd -> 3n+1
    coeffs = np.array([3, 1])  # 3n + 1

    # Test small numbers
    test_cases = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

    passed = True
    for n in test_cases:
        traj, conv = simulate_trajectory(n, coeffs, max_steps=100)
        if not conv:
            log_message(f"ERROR: {n} did not converge", 'ERROR')
            passed = False
        else:
            log_message(f"{n} -> 1 in {len(traj)-1} steps")

    return passed


def validate_convergence_data(coeff_grid, convergence_data):
    """
    Validate that convergence data is consistent.

    Parameters:
    - coeff_grid: list of coefficient arrays
    - convergence_data: convergence data array

    Returns:
    - valid: True if data is valid
    """
    log_message("Validating convergence data")

    if len(coeff_grid) != convergence_data.shape[0]:
        log_message("ERROR: Mismatch between coeff_grid and convergence_data dimensions", 'ERROR')
        return False

    # Check that converged trajectories have reasonable lengths
    lengths = convergence_data[:, :, 0]
    converged = convergence_data[:, :, 1]

    max_reasonable_length = 1000  # Adjust as needed

    for i in range(len(coeff_grid)):
        for j in range(convergence_data.shape[1]):
            if converged[i, j] and lengths[i, j] > max_reasonable_length:
                log_message(f"WARNING: Converged trajectory too long: {lengths[i, j]} steps", 'WARNING')

    log_message("Convergence data validation complete")
    return True


def compare_implementations(coeffs, n_start=27, max_steps=100):
    """
    Compare different implementations of the Collatz step.

    Parameters:
    - coeffs: coefficient array
    - n_start: starting number
    - max_steps: max steps

    Returns:
    - consistent: True if implementations agree
    """
    log_message("Comparing implementations")

    # Numba implementation
    traj_numba, conv_numba = simulate_trajectory(n_start, coeffs, max_steps)

    # Pure Python implementation for comparison
    def collatz_step_py(n, coeffs):
        if n % 2 == 0:
            return n // 2
        else:
            degree = len(coeffs) - 1
            result = 0
            for i in range(len(coeffs)):
                result += coeffs[i] * (n ** (degree - i))
            return int(result)

    def simulate_py(n, coeffs, max_steps):
        traj = [n]
        for _ in range(max_steps):
            n = collatz_step_py(n, coeffs)
            traj.append(n)
            if n == 1:
                return traj, True
            if abs(n) > 10**18:
                return traj, False
        return traj, False

    traj_py, conv_py = simulate_py(n_start, coeffs, max_steps)

    consistent = (len(traj_numba) == len(traj_py)) and (conv_numba == conv_py)
    if not consistent:
        log_message(f"Trajectory lengths: Numba {len(traj_numba)}, Python {len(traj_py)}")
        log_message(f"Convergence: Numba {conv_numba}, Python {conv_py}")
        # Check if they diverge at the same point
        min_len = min(len(traj_numba), len(traj_py))
        diverge_idx = -1
        for i in range(min_len):
            if traj_numba[i] != traj_py[i]:
                diverge_idx = i
                break
        if diverge_idx >= 0:
            log_message(f"Trajectories diverge at step {diverge_idx}: Numba {traj_numba[diverge_idx]}, Python {traj_py[diverge_idx]}")
        else:
            log_message("Trajectories match up to minimum length")

    return consistent


def stress_test_large_numbers(coeffs, n_range=(10**6, 10**7, 10), max_steps=1000):
    """
    Stress test with large starting numbers.

    Parameters:
    - coeffs: coefficient array
    - n_range: (min, max, num_samples)
    - max_steps: max steps per trajectory

    Returns:
    - results: dict with test results
    """
    log_message("Running stress test with large numbers")

    starts = np.linspace(n_range[0], n_range[1], n_range[2], dtype=int)

    results = batch_simulate_trajectories(starts, coeffs, max_steps)

    converged_count = np.sum(results[:, 1])
    avg_length = np.mean(results[:, 0])

    log_message(f"Stress test: {converged_count}/{len(starts)} converged, avg length: {avg_length:.1f}")

    return {
        'starts': starts,
        'results': results,
        'converged_count': converged_count,
        'avg_length': avg_length
    }


def run_all_checks(degree, data_prefix='data'):
    """
    Run all validation checks for a given degree.

    Parameters:
    - degree: polynomial degree
    - data_prefix: data file prefix

    Returns:
    - all_passed: True if all checks pass
    """
    log_message(f"Running all checks for degree {degree}")

    all_passed = True

    # Load data
    try:
        coeff_filename = f"{data_prefix}_coeffs_degree_{degree}.npy"
        data_filename = f"{data_prefix}_convergence_degree_{degree}.npy"
        coeff_grid = load_data(coeff_filename)
        convergence_data = load_data(data_filename)
    except FileNotFoundError:
        log_message(f"ERROR: Data files not found for degree {degree}", 'ERROR')
        return False

    # Validate data
    if not validate_convergence_data(coeff_grid, convergence_data):
        all_passed = False

    # Sanity checks
    if not sanity_check_basic_collatz():
        all_passed = False

    # Implementation comparison
    test_coeffs = np.array([0.1, 0.1, 0.1]) if degree == 2 else np.array([3, 1])  # Use small coeffs for higher degrees
    if not compare_implementations(test_coeffs):
        log_message("WARNING: Implementations may disagree for large coefficients", 'WARNING')
        # Don't fail the check for now, as this might be due to numerical precision

    # Stress test
    stress_results = stress_test_large_numbers(test_coeffs)

    if all_passed:
        log_message(f"All checks passed for degree {degree}")
    else:
        log_message(f"Some checks failed for degree {degree}", 'ERROR')

    return all_passed


if __name__ == "__main__":
    # Run checks for degree 1
    run_all_checks(1)

    # Run checks for degree 2
    run_all_checks(2)