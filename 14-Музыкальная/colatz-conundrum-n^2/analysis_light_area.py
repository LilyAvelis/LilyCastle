import numpy as np
import pickle
from scipy import ndimage
from scipy.ndimage import label
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
import plotly.graph_objects as go

def find_light_area(data_slice, a_vals, b_vals, threshold):
    """
    Find the largest connected component where data < threshold.
    Return area, min_a, max_a, min_b, max_b.
    """
    mask = (data_slice < threshold).astype(int)
    labeled_mask, num_features = label(mask)
    
    if num_features == 0:
        return 0, np.nan, np.nan, np.nan, np.nan
    
    # Find the largest component
    component_sizes = np.bincount(labeled_mask.flat)[1:]  # Skip 0
    largest_label = np.argmax(component_sizes) + 1
    component_mask = (labeled_mask == largest_label)
    
    area = np.sum(component_mask)
    a_indices, b_indices = np.where(component_mask)
    min_a = a_vals[a_indices.min()]
    max_a = a_vals[a_indices.max()]
    min_b = b_vals[b_indices.min()]
    max_b = b_vals[b_indices.max()]
    
    return area, min_a, max_a, min_b, max_b

def analyze_light_area(data_file='data_grid_3d.pkl', thresholds=None):
    """
    Analyze the light area for each c and each threshold.
    Save results to analysis_light_area.pkl
    """
    with open(data_file, 'rb') as f:
        data_dict = pickle.load(f)

    a_vals = data_dict['a_vals']
    b_vals = data_dict['b_vals']
    c_vals = data_dict['c_vals']
    data = data_dict['data']  # shape (len(a_vals), len(b_vals), len(c_vals))

    if thresholds is None:
        # Compute global thresholds based on all data
        flat_data = data.flatten()
        print("Data percentiles:", np.percentile(flat_data, [0,5,10,25,50,75,90,100]))
        thresholds = [1.68, 1.69, 1.70]  # Fixed low thresholds

    results = []

    for c_idx, c in enumerate(c_vals):
        data_slice = data[:, :, c_idx]
        for thresh in thresholds:
            area, min_a, max_a, min_b, max_b = find_light_area(data_slice, a_vals, b_vals, thresh)
            results.append({
                'c': c,
                'threshold': thresh,
                'area': area,
                'min_a': min_a,
                'max_a': max_a,
                'min_b': min_b,
                'max_b': max_b
            })

    with open('analysis_light_area.pkl', 'wb') as f:
        pickle.dump(results, f)

    print("Analysis saved to analysis_light_area.pkl")

def plot_light_area_evolution(data_file='analysis_light_area.pkl'):
    """
    Plot area, min/max a, min/max b vs c for each threshold.
    """
    with open(data_file, 'rb') as f:
        results = pickle.load(f)

    # Group by threshold
    thresholds = sorted(set(r['threshold'] for r in results))
    c_vals = sorted(set(r['c'] for r in results))

    fig, axes = plt.subplots(2, 2, figsize=(12, 10))

    for thresh in thresholds:
        thresh_results = [r for r in results if r['threshold'] == thresh]
        c_list = [r['c'] for r in thresh_results]
        area_list = [r['area'] for r in thresh_results]
        min_a_list = [r['min_a'] for r in thresh_results]
        max_a_list = [r['max_a'] for r in thresh_results]
        min_b_list = [r['min_b'] for r in thresh_results]
        max_b_list = [r['max_b'] for r in thresh_results]

        label = f'thresh={thresh:.2f}'

        axes[0,0].plot(c_list, area_list, label=label)
        axes[0,0].set_title('Area vs c')
        axes[0,0].set_xlabel('c')
        axes[0,0].set_ylabel('Area')

        axes[0,1].plot(c_list, min_a_list, label=f'min_a {label}', linestyle='--')
        axes[0,1].plot(c_list, max_a_list, label=f'max_a {label}')
        axes[0,1].set_title('a boundaries vs c')
        axes[0,1].set_xlabel('c')
        axes[0,1].set_ylabel('a')

        axes[1,0].plot(c_list, min_b_list, label=f'min_b {label}', linestyle='--')
        axes[1,0].plot(c_list, max_b_list, label=f'max_b {label}')
        axes[1,0].set_title('b boundaries vs c')
        axes[1,0].set_xlabel('c')
        axes[1,0].set_ylabel('b')

        # Placeholder for shape params, e.g., width_a = max_a - min_a
        width_a = [max_a - min_a for max_a, min_a in zip(max_a_list, min_a_list)]
        width_b = [max_b - min_b for max_b, min_b in zip(max_b_list, min_b_list)]
        axes[1,1].plot(c_list, width_a, label=f'width_a {label}')
        axes[1,1].plot(c_list, width_b, label=f'width_b {label}', linestyle='--')
        axes[1,1].set_title('Widths vs c')
        axes[1,1].set_xlabel('c')
        axes[1,1].set_ylabel('Width')

    for ax in axes.flat:
        ax.legend()
        ax.grid(True)

    plt.tight_layout()
    plt.savefig('1graph_light_area_evolution.png', dpi=300)
    plt.show()
    print("Evolution plot saved to 1graph_light_area_evolution.png")

def visualize_2d_light_area(data_file='data_grid_3d.pkl', c_indices=None, threshold=0.5):
    """
    For selected c slices, plot the light area (central component below threshold).
    """
    if c_indices is None:
        c_indices = [10, 25, 40]  # Example indices

    with open(data_file, 'rb') as f:
        data_dict = pickle.load(f)

    a_vals = data_dict['a_vals']
    b_vals = data_dict['b_vals']
    c_vals = data_dict['c_vals']
    data = data_dict['data']

    fig, axes = plt.subplots(1, len(c_indices), figsize=(15, 5))

    for i, c_idx in enumerate(c_indices):
        c = c_vals[c_idx]
        data_slice = data[:, :, c_idx]

        # Find light area mask
        mask = (data_slice < threshold).astype(int)
        labeled_mask, num_features = label(mask)
        if num_features > 0:
            component_sizes = np.bincount(labeled_mask.flat)[1:]
            largest_label = np.argmax(component_sizes) + 1
            light_mask = (labeled_mask == largest_label)
        else:
            light_mask = np.zeros_like(mask)

        axes[i].imshow(light_mask, extent=[b_vals.min(), b_vals.max(), a_vals.min(), a_vals.max()],
                       origin='lower', cmap='Blues', alpha=0.7)
        axes[i].set_title(f'Light Area at c={c:.2f}, thresh={threshold:.2f}')
        axes[i].set_xlabel('b')
        axes[i].set_ylabel('a')

    plt.tight_layout()
    plt.savefig('1graph_2d_light_areas.png', dpi=300)
    plt.show()
    print("2D light areas saved to 1graph_2d_light_areas.png")

def visualize_3d_light_area(data_file='analysis_light_area.pkl'):
    """
    3D plot: c vs a/b boundaries, with area as color or size.
    """
    with open(data_file, 'rb') as f:
        results = pickle.load(f)

    # For one threshold, say the first
    thresh = results[0]['threshold']
    thresh_results = [r for r in results if r['threshold'] == thresh]

    c_list = [r['c'] for r in thresh_results]
    min_a_list = [r['min_a'] for r in thresh_results]
    max_a_list = [r['max_a'] for r in thresh_results]
    min_b_list = [r['min_b'] for r in thresh_results]
    max_b_list = [r['max_b'] for r in thresh_results]
    area_list = [r['area'] for r in thresh_results]

    fig = plt.figure(figsize=(10, 8))
    ax = fig.add_subplot(111, projection='3d')

    # Plot surfaces for min/max
    ax.plot(c_list, min_a_list, min_b_list, label='min a,min b', color='blue')
    ax.plot(c_list, max_a_list, max_b_list, label='max a,max b', color='red')
    ax.plot(c_list, min_a_list, max_b_list, label='min a,max b', color='green')
    ax.plot(c_list, max_a_list, min_b_list, label='max a,min b', color='orange')

    ax.set_xlabel('c')
    ax.set_ylabel('a')
    ax.set_zlabel('b')
    ax.set_title(f'3D Light Area Boundaries (thresh={thresh:.2f})')
    ax.legend()

    plt.savefig('1graph_3d_light_boundaries.png', dpi=300)
    plt.show()
    print("3D boundaries saved to 1graph_3d_light_boundaries.png")

if __name__ == "__main__":
    # First, analyze
    analyze_light_area()

    # Then plot
    plot_light_area_evolution()

    # Visualize 2D
    visualize_2d_light_area()

    # Visualize 3D
    visualize_3d_light_area()