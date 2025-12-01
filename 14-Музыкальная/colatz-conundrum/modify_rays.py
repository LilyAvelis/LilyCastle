import numpy as np
from analysis_classification import generate_phase_data
from visualization_phase_map import plot_phase_map
import matplotlib.pyplot as plt

def add_noise_to_parameters(a_range, b_range, noise_level=0.01):
    """Add noise to parameter grid to modify rays"""
    np.random.seed(42)  # For reproducibility

    # Create noisy versions
    a_noisy = a_range[:, np.newaxis] + np.random.normal(0, noise_level, (len(a_range), len(b_range)))
    b_noisy = b_range[np.newaxis, :] + np.random.normal(0, noise_level, (len(a_range), len(b_range)))

    return a_noisy, b_noisy

def generate_noisy_phase_data(a_range, b_range, n_starts, noise_level=0.01,
                             max_steps=1000, max_value=1e7, num_processes=32):
    """Generate phase data with noise added to parameters"""
    print(f"Generating phase data with noise level {noise_level}...")

    # Generate base data
    data_dict = generate_phase_data(a_range, b_range, n_starts, max_steps, max_value, num_processes)

    # Convert to array
    data = np.zeros((len(a_range), len(b_range)))
    for i, a in enumerate(a_range):
        for j, b in enumerate(b_range):
            data[i, j] = data_dict.get((a, b), 0)

    # Add noise to parameters and regenerate for some points
    a_noisy, b_noisy = add_noise_to_parameters(a_range, b_range, noise_level)

    # Regenerate data for noisy points (sample some)
    noisy_indices = np.random.choice(len(a_range) * len(b_range),
                                   size=int(0.1 * len(a_range) * len(b_range)),
                                   replace=False)

    print(f"Regenerating {len(noisy_indices)} points with noise...")
    for idx in noisy_indices:
        i = idx // len(b_range)
        j = idx % len(b_range)
        a_n = a_noisy[i, j]
        b_n = b_noisy[i, j]

        # Generate new data point
        from data_generation import classify_ab
        noisy_value = classify_ab(a_n, b_n, n_starts, max_steps, max_value)
        data[i, j] = noisy_value

    return data

def modify_collatz_rule(a_range, b_range, n_starts, modification_type='add_constant',
                       mod_param=0.1, max_steps=1000, max_value=1e7, num_processes=32):
    """Modify the Collatz rule to change ray patterns"""
    print(f"Generating phase data with modified Collatz rule: {modification_type}...")

    # We'll need to modify the data_generation logic
    # For now, let's add a constant offset to the odd step
    data_dict = {}

    # This is a simplified version - in practice you'd modify the JIT function
    for a in a_range:
        for b in b_range:
            # Simulate with modified rule: T(n) = n/2 if even, a*n + b + mod_param if odd
            modified_b = b + mod_param if modification_type == 'add_constant' else b
            from data_generation import classify_ab
            avg_steps = classify_ab(a, modified_b, n_starts, max_steps, max_value)
            data_dict[(a, b)] = avg_steps

    # Convert to array
    data = np.zeros((len(a_range), len(b_range)))
    for i, a in enumerate(a_range):
        for j, b in enumerate(b_range):
            data[i, j] = data_dict[(a, b)]

    return data

def create_modified_ray_map():
    """Create phase maps with modified rays"""
    # Focus on the ray region
    a_range = np.linspace(2, 5, 100)
    b_range = np.linspace(-20, 0, 100)
    n_starts = list(range(1, 101))

    # Original
    print("Generating original ray map...")
    data_original = generate_noisy_phase_data(a_range, b_range, n_starts, noise_level=0)

    # With noise
    print("Generating noisy ray map...")
    data_noisy = generate_noisy_phase_data(a_range, b_range, n_starts, noise_level=0.05)

    # With modified rule
    print("Generating modified rule ray map...")
    data_modified = modify_collatz_rule(a_range, b_range, n_starts,
                                       modification_type='add_constant', mod_param=0.5)

    # Plot comparison
    fig, (ax1, ax2, ax3) = plt.subplots(1, 3, figsize=(18, 6))

    im1 = ax1.imshow(data_original, extent=[b_range[0], b_range[-1], a_range[0], a_range[-1]],
                     origin='lower', cmap='viridis', aspect='auto')
    ax1.set_title('Original Rays')
    ax1.set_xlabel('b')
    ax1.set_ylabel('a')
    plt.colorbar(im1, ax=ax1)

    im2 = ax2.imshow(data_noisy, extent=[b_range[0], b_range[-1], a_range[0], a_range[-1]],
                     origin='lower', cmap='viridis', aspect='auto')
    ax2.set_title('Noisy Rays (noise=0.05)')
    ax2.set_xlabel('b')
    plt.colorbar(im2, ax=ax2)

    im3 = ax3.imshow(data_modified, extent=[b_range[0], b_range[-1], a_range[0], a_range[-1]],
                     origin='lower', cmap='viridis', aspect='auto')
    ax3.set_title('Modified Rule (b+0.5)')
    ax3.set_xlabel('b')
    plt.colorbar(im3, ax=ax3)

    plt.tight_layout()
    plt.savefig('1graph_modified_rays_comparison.png', dpi=150, bbox_inches='tight')
    plt.close()

    print("Modified ray maps saved as 1graph_modified_rays_comparison.png")

if __name__ == '__main__':
    create_modified_ray_map()