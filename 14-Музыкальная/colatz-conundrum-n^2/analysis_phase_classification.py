import numpy as np
import pickle
import matplotlib.pyplot as plt

def classify_behavior(data):
    """
    Classify each (a,b) point based on avg_log_steps.
    - 0: fast divergence (low values)
    - 1: slow/meta-stable (medium)
    - 2: convergence/cycle (high values)
    """
    # Define thresholds based on data
    low_thresh = np.percentile(data, 33)
    high_thresh = np.percentile(data, 66)

    classification = np.zeros_like(data, dtype=int)
    classification[data < low_thresh] = 0
    classification[(data >= low_thresh) & (data < high_thresh)] = 1
    classification[data >= high_thresh] = 2

    return classification

def plot_classification(data_file, output_image='1graph_classification.png'):
    """
    Load data, classify, and plot the classification map.
    """
    with open(data_file, 'rb') as f:
        data_dict = pickle.load(f)

    a_vals = data_dict['a_vals']
    b_vals = data_dict['b_vals']
    c = data_dict['c']
    data = data_dict['data']

    classification = classify_behavior(data)

    plt.figure(figsize=(10, 8))
    plt.imshow(classification, extent=[b_vals.min(), b_vals.max(), a_vals.min(), a_vals.max()],
               origin='lower', cmap='tab10', aspect='auto')
    plt.colorbar(ticks=[0, 1, 2], label='Behavior Class')
    plt.xlabel('b')
    plt.ylabel('a')
    plt.title(f'Behavior Classification for Quadratic Collatz (c={c})')
    plt.savefig(output_image, dpi=300)
    plt.show()
    print(f"Classification plot saved to {output_image}")

    # Print summary
    unique, counts = np.unique(classification, return_counts=True)
    total = np.prod(classification.shape)
    for cls, count in zip(unique, counts):
        pct = count / total * 100
        if cls == 0:
            print(".1f")
        elif cls == 1:
            print(".1f")
        elif cls == 2:
            print(".1f")

if __name__ == "__main__":
    plot_classification('data_grid.pkl')