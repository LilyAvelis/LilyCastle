import numpy as np
from analysis_classification import generate_phase_data
import matplotlib.pyplot as plt
from scipy import ndimage

def generate_extended_phase_data(a_range, b_range, n_starts, max_steps=5000, max_value=1e9, num_processes=32):
    """Generate phase data for extended ranges"""
    print("Generating extended phase data for ray analysis...")
    data_dict = generate_phase_data(a_range, b_range, n_starts, max_steps, max_value, num_processes)

    # Convert dict to 2D array
    data = np.zeros((len(a_range), len(b_range)))
    for i, a in enumerate(a_range):
        for j, b in enumerate(b_range):
            data[i, j] = data_dict.get((a, b), 0)

    return data

def find_rays_by_gradient(data, a_range, b_range, threshold_percentile=95):
    """Find rays by analyzing gradients in the phase data"""
    # Calculate gradients
    grad_a = np.abs(np.gradient(data, axis=0))  # gradient along a
    grad_b = np.abs(np.gradient(data, axis=1))  # gradient along b

    # Combined gradient magnitude
    grad_magnitude = np.sqrt(grad_a**2 + grad_b**2)

    # Threshold to find strong gradients (potential rays)
    threshold = np.percentile(grad_magnitude, threshold_percentile)
    ray_mask = grad_magnitude > threshold

    return ray_mask, grad_magnitude

def extract_ray_lines(ray_mask, a_range, b_range, min_line_length=10):
    """Extract line segments from ray mask"""
    from skimage import measure

    # Label connected components
    labeled_mask = measure.label(ray_mask)

    # Find regions
    regions = measure.regionprops(labeled_mask)

    rays = []
    for region in regions:
        if region.area > min_line_length:
            # Get bounding box
            min_row, min_col, max_row, max_col = region.bbox

            # Calculate center line
            center_row = (min_row + max_row) // 2
            center_col = (min_col + max_col) // 2

            # Convert to parameter values
            a_center = a_range[center_row]
            b_center = b_range[center_col]

            # Estimate angle from orientation
            orientation = region.orientation
            angle_deg = np.degrees(orientation)

            rays.append({
                'a_center': a_center,
                'b_center': b_center,
                'angle_deg': angle_deg,
                'length': region.major_axis_length,
                'area': region.area
            })

    return rays

def plot_rays(data, a_range, b_range, ray_mask, rays):
    """Plot phase map with detected rays"""
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))

    # Original phase map
    im1 = ax1.imshow(data, extent=[b_range[0], b_range[-1], a_range[0], a_range[-1]],
                     origin='lower', cmap='viridis', aspect='auto')
    ax1.set_xlabel('b')
    ax1.set_ylabel('a')
    ax1.set_title('Phase Map with Rays')
    plt.colorbar(im1, ax=ax1)

    # Overlay ray mask
    ax1.imshow(ray_mask, extent=[b_range[0], b_range[-1], a_range[0], a_range[-1]],
               origin='lower', cmap='Reds', alpha=0.3)

    # Plot detected ray centers
    for ray in rays:
        ax1.plot(ray['b_center'], ray['a_center'], 'ro', markersize=3, alpha=0.7)
        ax1.text(ray['b_center']+0.1, ray['a_center']+0.1,
                f"{ray['angle_deg']:.1f}°", fontsize=8, color='red')

    # Ray mask only
    ax2.imshow(ray_mask, extent=[b_range[0], b_range[-1], a_range[0], a_range[-1]],
               origin='lower', cmap='gray')
    ax2.set_xlabel('b')
    ax2.set_ylabel('a')
    ax2.set_title('Detected Rays')

    plt.tight_layout()
    plt.savefig('1graph_detected_rays_gradient.png', dpi=150, bbox_inches='tight')
    plt.close()

def analyze_rays_extended():
    """Main function for extended ray analysis"""
    # Extended range focusing on a > 2 where rays are visible
    a_range = np.linspace(2, 5, 150)  # Focus on a > 2
    b_range = np.linspace(-20, 0, 150)  # Negative b
    n_starts = list(range(1, 1001))  # Increased for deeper analysis
    max_steps = 5000
    max_value = 1e9

    # Generate data
    data = generate_extended_phase_data(a_range, b_range, n_starts, max_steps, max_value)

    # Find rays using gradient analysis
    ray_mask, grad_magnitude = find_rays_by_gradient(data, a_range, b_range)

    # Extract ray lines
    rays = extract_ray_lines(ray_mask, a_range, b_range)

    # Sort by length
    rays.sort(key=lambda x: x['length'], reverse=True)

    print(f"Found {len(rays)} ray segments:")
    for i, ray in enumerate(rays[:10]):  # Show top 10
        print(f"Ray {i+1}: a={ray['a_center']:.3f}, b={ray['b_center']:.3f}, angle={ray['angle_deg']:.1f}°, length={ray['length']:.1f}")

    # Plot results
    plot_rays(data, a_range, b_range, ray_mask, rays)

    return rays

if __name__ == '__main__':
    rays = analyze_rays_extended()
    print(f"\nAnalysis complete. Check 1graph_detected_rays_gradient.png")
    print(f"Total rays found: {len(rays)}")