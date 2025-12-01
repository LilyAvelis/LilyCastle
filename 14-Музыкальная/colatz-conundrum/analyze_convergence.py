from data_generation import classify_ab
import numpy as np

# Test convergence in low-a regions
a_test = np.linspace(1, 1.5, 10)
b_test = np.linspace(-1, 1, 10)
n_test = list(range(1, 1001))  # up to 1000

results = {}
for a in a_test:
    for b in b_test:
        avg_steps = classify_ab(a, b, n_test)
        results[(a, b)] = avg_steps
        print(f"a={a:.2f}, b={b:.2f}: avg steps={avg_steps:.2f}")

# Check if all converge (avg_steps == max_steps means no divergence)
max_steps = 2000
convergent = all(steps < max_steps for steps in results.values())
print(f"All sequences in low-a region converge: {convergent}")