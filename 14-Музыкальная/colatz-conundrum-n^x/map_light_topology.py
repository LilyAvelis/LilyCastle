import numpy as np
import matplotlib.pyplot as plt
from helper_utils import batch_simulate_trajectories, log_message

def map_light_zone_topology(degree=2):
    log_message(f"Mapping Light Zone Topology for Degree {degree}...")
    
    try:
        center = np.load(f"light_zone_center_degree_{degree}.npy")
    except FileNotFoundError:
        log_message("Light zone center not found.")
        return

    log_message(f"Center: {center}")
    
    # Create a fine grid around the center
    # We will vary k2 (quadratic) and k1 (linear), keeping k0 fixed for 2D plot
    # Or maybe vary k2 and k0? Let's vary k2 and k1.
    
    span = 0.2
    resolution = 50
    
    k2_range = np.linspace(center[0] - span, center[0] + span, resolution)
    k1_range = np.linspace(center[1] - span, center[1] + span, resolution)
    
    convergence_map = np.zeros((resolution, resolution))
    
    start_range = np.arange(1, 100, 1)
    max_steps = 1000
    max_value = 10**18
    
    for i, k2 in enumerate(k2_range):
        for j, k1 in enumerate(k1_range):
            coeffs = center.copy()
            coeffs[0] = k2
            coeffs[1] = k1
            # coeffs[2] (k0) remains fixed
            
            results = batch_simulate_trajectories(start_range, coeffs, max_steps, max_value)
            rate = np.mean(results[:, 1])
            convergence_map[i, j] = rate
            
    # Plot
    plt.figure(figsize=(10, 8))
    plt.imshow(convergence_map, extent=[k1_range[0], k1_range[-1], k2_range[0], k2_range[-1]], 
               origin='lower', cmap='hot', aspect='auto')
    plt.colorbar(label='Convergence Rate')
    plt.xlabel('k_1 (Linear Coeff)')
    plt.ylabel('k_2 (Quadratic Coeff)')
    plt.title(f'Light Zone Topology (Degree {degree}) around {center}')
    plt.scatter([center[1]], [center[0]], c='cyan', marker='x', label='Center')
    plt.legend()
    plt.savefig(f'light_zone_topology_degree_{degree}.png')
    log_message(f"Saved topology map to light_zone_topology_degree_{degree}.png")

if __name__ == "__main__":
    map_light_zone_topology(2)
