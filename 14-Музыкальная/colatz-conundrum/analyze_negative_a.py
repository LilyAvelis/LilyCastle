from data_generation import classify_ab
import numpy as np

# Analyze slices for negative a
a_slices = [-2, -1, -0.5, 0, 0.5, 1]
b_range = np.linspace(-10, 10, 50)
n_starts = list(range(1, 101))

results = {}
for a in a_slices:
    steps = []
    for b in b_range:
        avg_step = classify_ab(a, b, n_starts)
        steps.append(avg_step)
    results[a] = np.mean(steps)

print("Average steps for different a:")
for a, avg in results.items():
    print(f"a={a}: avg steps={avg:.2f}")

# Check for a=-2, specific b
a = -2
b_test = [-5, 0, 5]
for b in b_test:
    avg = classify_ab(a, b, n_starts)
    print(f"a={a}, b={b}: avg steps={avg:.2f}")