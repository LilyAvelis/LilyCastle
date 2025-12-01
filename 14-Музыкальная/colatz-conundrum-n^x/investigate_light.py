import numpy as np
from helper_utils import load_data, log_message, batch_simulate_trajectories

def find_and_optimize_light_zone(degree=2):
    log_message(f"Investigating Light Zone for Degree {degree}...")
    
    # Load existing data
    try:
        coeffs = load_data(f"1graph_coeffs_degree_{degree}.npy")
        convergence = load_data(f"1graph_convergence_degree_{degree}.npy")
    except FileNotFoundError:
        log_message("Data not found. Please run generation first.")
        return

    # Calculate rates
    rates = np.mean(convergence[:, :, 1], axis=1)
    
    # Find top candidates
    top_indices = np.argsort(rates)[-10:] # Top 10
    best_rate = rates[top_indices[-1]]
    best_coeff = coeffs[top_indices[-1]]
    
    log_message(f"Best found rate in grid: {best_rate:.4f}")
    log_message(f"Best coefficients: {best_coeff}")
    
    if best_rate >= 0.99:
        log_message("Grid already found a Light Zone!")
        return

    log_message("Attempting local optimization to find the Light...")
    
    # Local search around best candidates
    current_best_rate = best_rate
    current_best_coeff = best_coeff
    
    # Simulation params
    start_range = np.arange(1, 200, 2) # Denser check
    max_steps = 2000
    max_value = 10**18
    
    for i in range(1000): # 1000 iterations of random walk
        # Perturb coefficients
        perturbation = np.random.normal(0, 0.05, size=current_best_coeff.shape)
        candidate_coeff = current_best_coeff + perturbation
        
        # Quick check
        results = batch_simulate_trajectories(start_range, candidate_coeff, max_steps, max_value)
        rate = np.mean(results[:, 1])
        
        if rate > current_best_rate:
            current_best_rate = rate
            current_best_coeff = candidate_coeff
            log_message(f"New best rate: {current_best_rate:.4f} at {current_best_coeff}")
            
            if current_best_rate >= 0.95:
                log_message("FOUND IT! The Light Zone exists.")
                break
    
    if current_best_rate < 0.95:
        log_message("Could not improve significantly with simple random walk.")
    else:
        # Save the discovery
        np.save(f"light_zone_center_degree_{degree}.npy", current_best_coeff)

if __name__ == "__main__":
    find_and_optimize_light_zone(2)
