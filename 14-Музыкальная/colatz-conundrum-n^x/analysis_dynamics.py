"""
Analysis module for Collatz polynomial dynamics.

Analyzes convergence data to identify regions of light (convergence) and death (divergence).
Includes criteria for light/death zones based on coefficient norms.
"""

import numpy as np
from numba import jit
from helper_utils import load_data, log_message


@jit(nopython=True)
def compute_convergence_rate(data):
    """
    Compute convergence rate for each parameter set.

    Parameters:
    - data: convergence data array (num_coeffs, num_starts, 2)

    Returns:
    - rates: array of convergence rates (0 to 1)
    """
    num_coeffs, num_starts, _ = data.shape
    rates = np.zeros(num_coeffs)

    for i in range(num_coeffs):
        converged = data[i, :, 1].sum()
        rates[i] = converged / num_starts

    return rates


def identify_light_zone(coeff_grid, convergence_rates, threshold=0.8):
    """
    Identify the 'light zone' where convergence rate is high.

    Parameters:
    - coeff_grid: list of coefficient arrays
    - convergence_rates: array of convergence rates
    - threshold: minimum convergence rate for light zone

    Returns:
    - light_indices: indices of parameter sets in light zone
    - light_coeffs: corresponding coefficients
    """
    light_indices = np.where(convergence_rates >= threshold)[0]
    light_coeffs = [coeff_grid[i] for i in light_indices]

    log_message(f"Identified {len(light_coeffs)} parameter sets in light zone (rate >= {threshold})")

    return light_indices, light_coeffs


def identify_death_zone(coeff_grid, convergence_rates, threshold=0.1):
    """
    Identify the 'death zone' where convergence rate is low.

    Parameters:
    - coeff_grid: list of coefficient arrays
    - convergence_rates: array of convergence rates
    - threshold: maximum convergence rate for death zone

    Returns:
    - death_indices: indices of parameter sets in death zone
    - death_coeffs: corresponding coefficients
    """
    death_indices = np.where(convergence_rates <= threshold)[0]
    death_coeffs = [coeff_grid[i] for i in death_indices]

    log_message(f"Identified {len(death_coeffs)} parameter sets in death zone (rate <= {threshold})")

    return death_indices, death_coeffs


def analyze_coefficient_norms(coeff_grid, convergence_rates):
    """
    Analyze relationship between coefficient norms and convergence.

    Parameters:
    - coeff_grid: list of coefficient arrays
    - convergence_rates: array of convergence rates

    Returns:
    - norms: array of coefficient norms
    - correlation: correlation coefficient between norm and convergence rate
    """
    norms = np.array([np.linalg.norm(coeffs) for coeffs in coeff_grid])

    correlation = np.corrcoef(norms, convergence_rates)[0, 1]

    log_message(f"Correlation between coefficient norm and convergence rate: {correlation:.3f}")

    return norms, correlation


def find_light_center(coeff_grid, convergence_rates):
    """
    Find the center of the light zone (parameter set with highest convergence).

    Parameters:
    - coeff_grid: list of coefficient arrays
    - convergence_rates: array of convergence rates

    Returns:
    - center_coeffs: coefficients of the center
    - center_rate: convergence rate at center
    """
    max_idx = np.argmax(convergence_rates)
    center_coeffs = coeff_grid[max_idx]
    center_rate = convergence_rates[max_idx]

    log_message(f"Light center at {center_coeffs} with convergence rate {center_rate:.3f}")

    return center_coeffs, center_rate


def death_cone_criterion(coeffs, degree, R=1.0):
    """
    Check if coefficients satisfy the death cone criterion.

    For large ||k||, trajectories diverge.

    Parameters:
    - coeffs: coefficient array
    - degree: polynomial degree
    - R: threshold norm

    Returns:
    - is_death: True if in death zone
    """
    norm = np.linalg.norm(coeffs)
    return norm > R


def light_zone_criterion(coeffs, r=0.1):
    """
    Check if coefficients are in the light zone (small perturbations).

    Parameters:
    - coeffs: coefficient array
    - r: radius of light zone

    Returns:
    - is_light: True if in light zone
    """
    norm = np.linalg.norm(coeffs)
    return norm < r


def analyze_degree(degree, data_prefix='data'):
    """
    Comprehensive analysis for a given degree.

    Parameters:
    - degree: polynomial degree
    - data_prefix: prefix for data files

    Returns:
    - analysis_results: dict with analysis results
    """
    log_message(f"Analyzing data for degree {degree}")

    # Load data
    coeff_filename = f"{data_prefix}_coeffs_degree_{degree}.npy"
    data_filename = f"{data_prefix}_convergence_degree_{degree}.npy"

    coeff_grid = load_data(coeff_filename)
    convergence_data = load_data(data_filename)

    # Compute convergence rates
    convergence_rates = compute_convergence_rate(convergence_data)

    # Identify zones
    light_indices, light_coeffs = identify_light_zone(coeff_grid, convergence_rates)
    death_indices, death_coeffs = identify_death_zone(coeff_grid, convergence_rates)

    # Analyze norms
    norms, correlation = analyze_coefficient_norms(coeff_grid, convergence_rates)

    # Find center
    center_coeffs, center_rate = find_light_center(coeff_grid, convergence_rates)

    results = {
        'degree': degree,
        'coeff_grid': coeff_grid,
        'convergence_rates': convergence_rates,
        'light_zone': {'indices': light_indices, 'coeffs': light_coeffs},
        'death_zone': {'indices': death_indices, 'coeffs': death_coeffs},
        'norms': norms,
        'norm_convergence_correlation': correlation,
        'light_center': {'coeffs': center_coeffs, 'rate': center_rate}
    }

    log_message(f"Analysis complete for degree {degree}")

    return results


if __name__ == "__main__":
    # Example analysis for degree 1
    results_1 = analyze_degree(1)

    # Example for degree 2
    results_2 = analyze_degree(2)