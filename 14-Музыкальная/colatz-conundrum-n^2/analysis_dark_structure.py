import pickle
import numpy as np
import matplotlib.pyplot as plt

def analyze_dark_structure(data_file='data_grid_3d.pkl', threshold=3.0):
    print(f"Loading {data_file}...")
    with open(data_file, 'rb') as f:
        data_dict = pickle.load(f)

    a_vals = data_dict['a_vals']
    b_vals = data_dict['b_vals']
    c_vals = data_dict['c_vals']
    data = data_dict['data']

    results = []

    for i, c in enumerate(c_vals):
        data_slice = data[:, :, i]
        
        # Mask for dark area
        mask = data_slice > threshold
        area = np.sum(mask)
        
        if area > 0:
            # Calculate centroid
            # indices where mask is true
            a_indices, b_indices = np.where(mask)
            
            # Convert to coordinates
            a_coords = a_vals[a_indices]
            b_coords = b_vals[b_indices]
            
            # Center of mass
            center_a = np.mean(a_coords)
            center_b = np.mean(b_coords)
            
            # Bounds
            min_a = np.min(a_coords)
            max_a = np.max(a_coords)
            min_b = np.min(b_coords)
            max_b = np.max(b_coords)
        else:
            center_a = np.nan
            center_b = np.nan
            min_a = np.nan
            max_a = np.nan
            min_b = np.nan
            max_b = np.nan

        results.append({
            'c': c,
            'area': area,
            'center_a': center_a,
            'center_b': center_b,
            'min_a': min_a,
            'max_a': max_a,
            'min_b': min_b,
            'max_b': max_b
        })

    # Plotting
    c_list = [r['c'] for r in results]
    area_list = [r['area'] for r in results]
    center_a_list = [r['center_a'] for r in results]
    center_b_list = [r['center_b'] for r in results]
    
    fig, axes = plt.subplots(2, 2, figsize=(12, 10))
    
    # Area vs C
    axes[0, 0].plot(c_list, area_list, marker='o')
    axes[0, 0].set_title(f'Area of Dark Region (thresh > {threshold})')
    axes[0, 0].set_xlabel('c')
    axes[0, 0].set_ylabel('Count of points')
    
    # Center A vs C
    axes[0, 1].plot(c_list, center_a_list, marker='o', color='orange')
    axes[0, 1].set_title('Center of Mass (a) vs c')
    axes[0, 1].set_xlabel('c')
    axes[0, 1].set_ylabel('a')
    
    # Center B vs C
    axes[1, 0].plot(c_list, center_b_list, marker='o', color='green')
    axes[1, 0].set_title('Center of Mass (b) vs c')
    axes[1, 0].set_xlabel('c')
    axes[1, 0].set_ylabel('b')
    
    # Trajectory in (a, b)
    axes[1, 1].plot(center_b_list, center_a_list, marker='o', color='purple')
    axes[1, 1].set_title('Trajectory of Center of Mass in (b, a)')
    axes[1, 1].set_xlabel('b')
    axes[1, 1].set_ylabel('a')
    
    plt.tight_layout()
    plt.savefig('1graph_dark_structure_analysis.png')
    print("Saved analysis plot to 1graph_dark_structure_analysis.png")
    
    # Save text summary
    with open('analysis_dark_structure_summary.txt', 'w') as f:
        f.write(f"Analysis of Dark Structure (Metric > {threshold})\n")
        f.write("------------------------------------------------\n")
        for r in results:
            f.write(f"c={r['c']:.2f}: Area={r['area']}, Center=({r['center_a']:.2f}, {r['center_b']:.2f})\n")
            
    print("Saved summary to analysis_dark_structure_summary.txt")

if __name__ == "__main__":
    analyze_dark_structure()
