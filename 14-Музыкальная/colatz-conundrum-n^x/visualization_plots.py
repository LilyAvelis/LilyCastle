"""
Visualization module for Collatz polynomial dynamics.

Creates plots and visualizations of light/death zones and convergence landscapes.
Uses matplotlib for 2D/3D plotting.
"""

import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
from helper_utils import load_data, log_message


def plot_convergence_landscape(coeff_grid, convergence_rates, degree, filename=None):
    """
    Plot the convergence landscape in parameter space.

    Parameters:
    - coeff_grid: list of coefficient arrays
    - convergence_rates: array of convergence rates
    - degree: polynomial degree
    - filename: output filename (optional)
    """
    log_message(f"Plotting convergence landscape for degree {degree}")

    if degree == 1:
        # 2D plot for linear case
        coeffs = np.array(coeff_grid)
        plt.figure(figsize=(10, 8))
        scatter = plt.scatter(coeffs[:, 0], coeffs[:, 1], c=convergence_rates,
                            cmap='RdYlGn', s=50, alpha=0.8)
        plt.colorbar(scatter, label='Convergence Rate')
        plt.xlabel('a (coefficient of n)')
        plt.ylabel('b (constant term)')
        plt.title(f'Convergence Landscape (Degree {degree})')
        plt.grid(True, alpha=0.3)

    elif degree == 2:
        # 3D plot for quadratic case
        fig = plt.figure(figsize=(12, 10))
        ax = fig.add_subplot(111, projection='3d')

        coeffs = np.array(coeff_grid)
        scatter = ax.scatter(coeffs[:, 0], coeffs[:, 1], coeffs[:, 2],
                           c=convergence_rates, cmap='RdYlGn', s=30, alpha=0.8)
        fig.colorbar(scatter, label='Convergence Rate')

        ax.set_xlabel('a (coefficient of n²)')
        ax.set_ylabel('b (coefficient of n)')
        ax.set_zlabel('c (constant term)')
        ax.set_title(f'Convergence Landscape (Degree {degree})')

    else:
        log_message(f"Visualization for degree {degree} not implemented", 'WARNING')
        return

    if filename:
        plt.savefig(filename, dpi=300, bbox_inches='tight')
        log_message(f"Plot saved to {filename}")

    plt.show()


def plot_light_death_zones(analysis_results, filename=None):
    """
    Plot identified light and death zones.

    Parameters:
    - analysis_results: results from analysis_dynamics.analyze_degree
    - filename: output filename (optional)
    """
    degree = analysis_results['degree']
    coeff_grid = np.array(analysis_results['coeff_grid'])
    convergence_rates = analysis_results['convergence_rates']

    light_indices = analysis_results['light_zone']['indices']
    death_indices = analysis_results['death_zone']['indices']

    log_message(f"Plotting light/death zones for degree {degree}")

    if degree == 1:
        plt.figure(figsize=(10, 8))

        # All points
        plt.scatter(coeff_grid[:, 0], coeff_grid[:, 1], c='gray', alpha=0.3, s=20, label='Other')

        # Light zone
        if len(light_indices) > 0:
            light_coeffs = coeff_grid[light_indices]
            plt.scatter(light_coeffs[:, 0], light_coeffs[:, 1], c='green', s=50, label='Light Zone')

        # Death zone
        if len(death_indices) > 0:
            death_coeffs = coeff_grid[death_indices]
            plt.scatter(death_coeffs[:, 0], death_coeffs[:, 1], c='red', s=50, label='Death Zone')

        plt.xlabel('a')
        plt.ylabel('b')
        plt.title(f'Light and Death Zones (Degree {degree})')
        plt.legend()
        plt.grid(True, alpha=0.3)

    elif degree == 2:
        fig = plt.figure(figsize=(12, 10))
        ax = fig.add_subplot(111, projection='3d')

        # All points
        ax.scatter(coeff_grid[:, 0], coeff_grid[:, 1], coeff_grid[:, 2],
                  c='gray', alpha=0.3, s=10, label='Other')

        # Light zone
        if len(light_indices) > 0:
            light_coeffs = coeff_grid[light_indices]
            ax.scatter(light_coeffs[:, 0], light_coeffs[:, 1], light_coeffs[:, 2],
                     c='green', s=50, label='Light Zone')

        # Death zone
        if len(death_indices) > 0:
            death_coeffs = coeff_grid[death_indices]
            ax.scatter(death_coeffs[:, 0], death_coeffs[:, 1], death_coeffs[:, 2],
                     c='red', s=50, label='Death Zone')

        ax.set_xlabel('a')
        ax.set_ylabel('b')
        ax.set_zlabel('c')
        ax.set_title(f'Light and Death Zones (Degree {degree})')
        ax.legend()

    if filename:
        plt.savefig(filename, dpi=300, bbox_inches='tight')
        log_message(f"Plot saved to {filename}")

    plt.show()


def plot_norm_vs_convergence(norms, convergence_rates, degree, filename=None):
    """
    Plot coefficient norm vs convergence rate.

    Parameters:
    - norms: array of coefficient norms
    - convergence_rates: array of convergence rates
    - degree: polynomial degree
    - filename: output filename (optional)
    """
    log_message(f"Plotting norm vs convergence for degree {degree}")

    plt.figure(figsize=(10, 6))
    plt.scatter(norms, convergence_rates, alpha=0.6, s=30)
    plt.xlabel('Coefficient Norm ||k||')
    plt.ylabel('Convergence Rate')
    plt.title(f'Coefficient Norm vs Convergence Rate (Degree {degree})')
    plt.grid(True, alpha=0.3)

    # Add trend line
    z = np.polyfit(norms, convergence_rates, 1)
    p = np.poly1d(z)
    plt.plot(np.sort(norms), p(np.sort(norms)), "r--", alpha=0.8)

    if filename:
        plt.savefig(filename, dpi=300, bbox_inches='tight')
        log_message(f"Plot saved to {filename}")

    plt.show()


def create_visualizations(degree, data_prefix='data', output_prefix='1graph'):
    """
    Create all visualizations for a given degree.

    Parameters:
    - degree: polynomial degree
    - data_prefix: data file prefix
    - output_prefix: output file prefix
    """
    from analysis_dynamics import analyze_degree

    log_message(f"Creating visualizations for degree {degree}")

    # Analyze data
    results = analyze_degree(degree, data_prefix)

    # Plot convergence landscape
    coeff_grid = results['coeff_grid']
    convergence_rates = results['convergence_rates']
    landscape_file = f"{output_prefix}_convergence_landscape_degree_{degree}.png"
    plot_convergence_landscape(coeff_grid, convergence_rates, degree, landscape_file)

    # Plot light/death zones
    zones_file = f"{output_prefix}_light_death_zones_degree_{degree}.png"
    plot_light_death_zones(results, zones_file)

    # Plot norm vs convergence
    norms = results['norms']
    norm_file = f"{output_prefix}_norm_vs_convergence_degree_{degree}.png"
    plot_norm_vs_convergence(norms, convergence_rates, degree, norm_file)

    log_message(f"Visualizations created for degree {degree}")


if __name__ == "__main__":
    # Create visualizations for degree 1
    create_visualizations(1)

    # Create visualizations for degree 2
    create_visualizations(2)