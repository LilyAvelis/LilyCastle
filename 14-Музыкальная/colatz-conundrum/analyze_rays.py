import numpy as np
from numba import jit
import matplotlib.pyplot as plt

@jit(nopython=True)
def simulate_orbit_with_values(n_start, a, b, max_steps=1000, max_value=1e6):
    """
    Simulate the orbit and collect all values.
    Returns: (steps, values_list)
    """
    values = []
    n = float(n_start)
    for step in range(max_steps):
        values.append(n)
        if n > max_value:
            return step, np.array(values)
        if abs(n) < 1e-10:  # avoid division by zero or very small
            return step, np.array(values)
        if abs(n % 2) < 1e-10:  # even
            n = n / 2
        else:
            n = a * n + b
    values.append(n)  # add final value
    return max_steps, np.array(values)

def analyze_ray_trajectory(a, b, n_start=1, max_steps=1000, max_value=1e7):
    """Analyze trajectory for specific a,b parameters"""
    steps, values = simulate_orbit_with_values(n_start, a, b, max_steps, max_value)

    # Check for cycles or patterns
    cycle_detected = False
    cycle_length = 0
    if len(values) > 10:
        # Simple cycle detection - check if last few values repeat
        last_10 = values[-10:]
        for i in range(1, len(last_10)//2 + 1):
            if np.allclose(last_10[-i:], last_10[-2*i:-i], rtol=1e-10):
                cycle_detected = True
                cycle_length = i
                break

    return {
        'steps': steps,
        'values': values,
        'diverged': steps >= max_steps,
        'cycle_detected': cycle_detected,
        'cycle_length': cycle_length,
        'final_value': values[-1] if len(values) > 0 else None
    }

    # Check for cycles or patterns
    cycle_detected = False
    cycle_length = 0
    if len(values) > 10:
        # Simple cycle detection - check if last few values repeat
        last_10 = values[-10:]
        for i in range(1, len(last_10)//2 + 1):
            if last_10[-i:] == last_10[-2*i:-i]:
                cycle_detected = True
                cycle_length = i
                break

    return {
        'steps': steps,
        'values': values,
        'diverged': steps >= max_steps,
        'cycle_detected': cycle_detected,
        'cycle_length': cycle_length,
        'final_value': values[-1] if values else None
    }

def plot_trajectory_analysis(a, b, trajectory_data):
    """Plot trajectory analysis"""
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))

    # Value trajectory
    ax1.plot(trajectory_data['values'], 'b-', alpha=0.7)
    ax1.set_yscale('log')
    ax1.set_xlabel('Step')
    ax1.set_ylabel('Value (log scale)')
    ax1.set_title(f'Trajectory for a={a}, b={b}')
    ax1.grid(True, alpha=0.3)

    # Phase space (if not diverged)
    if not trajectory_data['diverged'] and len(trajectory_data['values']) > 1:
        values = trajectory_data['values']
        ax2.plot(values[:-1], values[1:], 'r.', alpha=0.6, markersize=2)
        ax2.set_xlabel('n')
        ax2.set_ylabel('T(n)')
        ax2.set_title('Phase Space')
        ax2.grid(True, alpha=0.3)

    plt.tight_layout()
    plt.savefig(f'1graph_trajectory_a{a}_b{b}.png', dpi=150, bbox_inches='tight')
    plt.close()

if __name__ == '__main__':
    # Analyze specific points from rays
    ray_points = [
        (-0.5, -5.0),
        (-1.0, -10.0),
        (-1.5, -15.0),
        (0.5, -5.0),
        (1.0, -10.0)
    ]

    print("Analyzing ray trajectories...")
    for a, b in ray_points:
        print(f"Analyzing a={a}, b={b}")
        trajectory = analyze_ray_trajectory(a, b)
        plot_trajectory_analysis(a, b, trajectory)

        print(f"  Steps: {trajectory['steps']}")
        print(f"  Diverged: {trajectory['diverged']}")
        print(f"  Cycle detected: {trajectory['cycle_detected']}")
        if trajectory['cycle_detected']:
            print(f"  Cycle length: {trajectory['cycle_length']}")
        print(f"  Final value: {trajectory['final_value']}")
        print()

    print("Trajectory analysis complete. Check 1graph_trajectory_*.png files")