import pickle
import numpy as np

with open('data_grid_3d.pkl', 'rb') as f:
    data_dict = pickle.load(f)

a_vals = data_dict['a_vals']
b_vals = data_dict['b_vals']
c_vals = data_dict['c_vals']
data = data_dict['data']

center_a_idx = np.argmin(np.abs(a_vals - 0))
center_b_idx = np.argmin(np.abs(b_vals - 0))

print('Center values for each c:')
for c_idx, c in enumerate(c_vals):
    center_value = data[center_a_idx, center_b_idx, c_idx]
    min_value = np.min(data[:, :, c_idx])
    print(f'c={c:.2f}, center_value={center_value:.2f}, min_value={min_value:.2f}')

print('\nThresholds used:', [1.69, 1.70, 1.73])

with open('analysis_light_area.pkl', 'rb') as f:
    results = pickle.load(f)

print('\nFirst few results:')
for thresh in [1.68, 1.69, 1.70]:
    print(f'\nThreshold: {thresh}')
    thresh_results = [r for r in results if r['threshold'] == thresh]
    for r in thresh_results[:5]:  # First 5 per threshold
        print(f'  c={r["c"]:.2f}, area={r["area"]}, min_a={r["min_a"]:.2f}, max_a={r["max_a"]:.2f}, min_b={r["min_b"]:.2f}, max_b={r["max_b"]:.2f}')
    print('  ...')