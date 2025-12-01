import numpy as np
import matplotlib.pyplot as plt
from skimage import io, color, filters, feature
from skimage.transform import hough_line, hough_line_peaks

def load_and_preprocess_image(image_path):
    """Load image and preprocess for line detection"""
    # Load image
    img = io.imread(image_path)

    # Handle RGBA images
    if img.shape[-1] == 4:
        img = img[..., :3]  # Remove alpha channel

    # Convert to grayscale if needed
    if len(img.shape) == 3:
        img = color.rgb2gray(img)

    # Normalize to 0-1
    img = img.astype(float) / 255.0

    return img

def detect_lines_hough(image, min_angle=None, max_angle=None):
    """Detect lines using Hough transform"""
    # For phase maps, rays might be bright areas, so invert and threshold
    # Threshold to find bright areas (potential rays)
    threshold = filters.threshold_otsu(image)
    binary = image > threshold

    # Or try to find edges in the bright areas
    edges = feature.canny(binary, sigma=1)

    # Alternative: use sobel to find gradients
    from skimage import filters as skfilters
    sobel = skfilters.sobel(image)
    edges = sobel > filters.threshold_otsu(sobel)

    # Perform Hough transform
    h, theta, d = hough_line(edges)

    # Find peaks in Hough space
    lines = []
    for _, angle, dist in zip(*hough_line_peaks(h, theta, d, num_peaks=50, threshold=0.1*h.max())):
        # Convert angle to degrees
        angle_deg = np.degrees(angle)

        # Filter by angle range if specified (focus on rays which might be at certain angles)
        if min_angle is not None and angle_deg < min_angle:
            continue
        if max_angle is not None and angle_deg > max_angle:
            continue

        lines.append((angle_deg, dist))

    return lines, edges

def plot_detected_lines(image, lines, edges):
    """Plot original image with detected lines"""
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 6))

    # Original image
    ax1.imshow(image, cmap='viridis')
    ax1.set_title('Original Phase Map')
    ax1.axis('off')

    # Edges with detected lines
    ax2.imshow(edges, cmap='gray')
    ax2.set_title('Detected Lines')

    # Plot lines
    height, width = image.shape
    for angle_deg, dist in lines:
        angle_rad = np.radians(angle_deg)
        # Calculate line endpoints
        x0 = (dist - 0 * np.cos(angle_rad)) / np.sin(angle_rad)
        x1 = (dist - height * np.cos(angle_rad)) / np.sin(angle_rad)
        y0, y1 = 0, height

        # Adjust for image bounds
        if angle_rad != 0:
            x0 = max(0, min(width, x0))
            x1 = max(0, min(width, x1))

        ax2.plot([x0, x1], [y0, y1], 'r-', linewidth=2, alpha=0.7)
        ax2.text(x0+10, y0+10, f'{angle_deg:.1f}°', color='red', fontsize=8)

    plt.tight_layout()
    plt.savefig('1graph_detected_lines.png', dpi=150, bbox_inches='tight')
    plt.close()

def analyze_ray_angles(image_path):
    """Main function to analyze ray angles"""
    print("Loading and preprocessing image...")
    img = load_and_preprocess_image(image_path)

    print("Detecting lines using Hough transform...")
    lines, edges = detect_lines_hough(img)

    print(f"Found {len(lines)} lines:")
    for i, (angle, dist) in enumerate(lines):
        print(".1f")

    print("Plotting results...")
    plot_detected_lines(img, lines, edges)

    return lines

if __name__ == '__main__':
    # Analyze the rays in b negative map
    image_path = 'rays_b_negative.png'
    lines = analyze_ray_angles(image_path)
    print(f"\nAnalysis complete. Check 1graph_detected_lines.png for visualization.")
    print(f"Detected angles: {[f'{angle:.1f}°' for angle, _ in lines]}")