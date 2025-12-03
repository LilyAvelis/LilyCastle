import numpy as np
import matplotlib.pyplot as plt
from helper_utils import batch_simulate_trajectories, log_message

def investigate_boundaries():
    # 1. Linear Case Boundary
    log_message("Scanning Linear Case (Degree 1) boundaries...")
    a_values = np.linspace(-5, 5, 100)
    rates_1 = []
    
    start_range = np.arange(1, 100, 1)
    max_steps = 1000
    max_value = 10**18
    
    for a in a_values:
        coeffs = np.array([a, 1.0]) # an + 1
        results = batch_simulate_trajectories(start_range, coeffs, max_steps, max_value)
        rate = np.mean(results[:, 1])
        rates_1.append(rate)
        
    # Analyze Linear Results
    rates_1 = np.array(rates_1)
    light_indices = np.where(rates_1 > 0.8)[0]
    if len(light_indices) > 0:
        min_light = a_values[light_indices[0]]
        max_light = a_values[light_indices[-1]]
        log_message(f"Linear Light Zone: [{min_light:.2f}, {max_light:.2f}]")
    
    # 2. Quadratic Light Channel Width (Zoomed)
    log_message("Scanning Quadratic Light Channel Width (Zoomed)...")
    k2_values = np.linspace(-0.1, 0.1, 200) # Zoom in
    rates_2 = []
    
    for k2 in k2_values:
        coeffs = np.array([k2, -1.955, 2.174]) # Use the optimized center
        results = batch_simulate_trajectories(start_range, coeffs, max_steps, max_value)
        rate = np.mean(results[:, 1])
        rates_2.append(rate)
        
    # Analyze Quadratic Results
    rates_2 = np.array(rates_2)
    light_indices_2 = np.where(rates_2 > 0.8)[0]
    if len(light_indices_2) > 0:
        min_light_2 = k2_values[light_indices_2[0]]
        max_light_2 = k2_values[light_indices_2[-1]]
        log_message(f"Quadratic Light Channel (k2): [{min_light_2:.4f}, {max_light_2:.4f}]")
    else:
        log_message("No Light Channel found in this k2 range.")

if __name__ == "__main__":
    investigate_boundaries()
