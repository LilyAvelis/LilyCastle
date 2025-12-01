import numpy as np
import matplotlib.pyplot as plt
from helper_utils import load_data, log_message

def analyze_norm_vs_convergence(degree, data_prefix='1graph'):
    log_message(f"Analyzing Degree {degree}...")
    
    # Load data
    coeffs = load_data(f"{data_prefix}_coeffs_degree_{degree}.npy")
    convergence = load_data(f"{data_prefix}_convergence_degree_{degree}.npy")
    
    # convergence shape: (num_coeffs, num_starts, 2)
    # 0: length, 1: converged (1 or 0)
    
    # Calculate convergence rate for each coefficient set
    # Mean of the 'converged' flag across all starts
    convergence_rates = np.mean(convergence[:, :, 1], axis=1)
    
    # Calculate norm of coefficients
    # coeffs shape: (num_coeffs, degree+1)
    norms = np.linalg.norm(coeffs, axis=1)
    
    # Scatter plot
    plt.figure(figsize=(10, 6))
    plt.scatter(norms, convergence_rates, alpha=0.5, s=10)
    plt.xlabel('Coefficient Norm ||k||')
    plt.ylabel('Convergence Rate')
    plt.title(f'Norm vs Convergence Rate (Degree {degree})')
    plt.grid(True)
    plt.savefig(f'gemini_norm_vs_conv_deg{degree}.png')
    log_message(f"Saved plot to gemini_norm_vs_conv_deg{degree}.png")
    
    # Analyze "Death Cone"
    # Find threshold R where norm > R => rate < epsilon
    epsilon = 0.05
    high_norm_mask = norms > 1.0 # Start looking above 1.0
    if np.any(high_norm_mask):
        high_norm_rates = convergence_rates[high_norm_mask]
        max_rate_high_norm = np.max(high_norm_rates)
        log_message(f"Max convergence rate for ||k|| > 1.0: {max_rate_high_norm:.4f}")
    
    # Analyze "Light Zone"
    # Find threshold r where norm < r => rate > 1-epsilon
    low_norm_mask = norms < 0.5
    if np.any(low_norm_mask):
        low_norm_rates = convergence_rates[low_norm_mask]
        min_rate_low_norm = np.min(low_norm_rates)
        avg_rate_low_norm = np.mean(low_norm_rates)
        log_message(f"Min convergence rate for ||k|| < 0.5: {min_rate_low_norm:.4f}")
        log_message(f"Avg convergence rate for ||k|| < 0.5: {avg_rate_low_norm:.4f}")

    # Specific check for Degree 2: k_2 influence
    if degree == 2:
        k2 = coeffs[:, 0] # Highest degree coeff
        plt.figure(figsize=(10, 6))
        plt.scatter(k2, convergence_rates, alpha=0.5, s=10)
        plt.xlabel('Coefficient k_2')
        plt.ylabel('Convergence Rate')
        plt.title(f'k_2 vs Convergence Rate (Degree {degree})')
        plt.grid(True)
        plt.savefig(f'gemini_k2_vs_conv_deg{degree}.png')
        log_message(f"Saved plot to gemini_k2_vs_conv_deg{degree}.png")
        
        # Check if any high convergence exists for |k2| > 0.1
        mask_k2 = np.abs(k2) > 0.1
        if np.any(mask_k2):
            max_rate_k2 = np.max(convergence_rates[mask_k2])
            log_message(f"Max convergence rate for |k2| > 0.1: {max_rate_k2:.4f}")

        # Zoom in on k2 near 0
        mask_zoom = np.abs(k2) < 0.5
        if np.any(mask_zoom):
            plt.figure(figsize=(10, 6))
            plt.scatter(k2[mask_zoom], convergence_rates[mask_zoom], alpha=0.5, s=20)
            plt.xlabel('Coefficient k_2 (Zoomed)')
            plt.ylabel('Convergence Rate')
            plt.title(f'k_2 vs Convergence Rate (Degree {degree}) - Zoomed')
            plt.grid(True)
            plt.axvline(x=0, color='r', linestyle='--', alpha=0.3)
            plt.savefig(f'gemini_k2_zoom_deg{degree}.png')
            log_message(f"Saved plot to gemini_k2_zoom_deg{degree}.png")

if __name__ == "__main__":
    analyze_norm_vs_convergence(1)
    analyze_norm_vs_convergence(2)
