import numpy as np
from analysis_classification import generate_phase_data
from visualization_phase_map import plot_phase_map
import argparse

def generate_zoom_levels(center_a, center_b, width, height, resolution, num_levels=3, zoom_factor=0.5):
    """
    Generate zoom levels starting from the given center, width, height.
    Each subsequent level zooms in by zoom_factor.
    Returns list of (a_min, a_max, b_min, b_max, level)
    """
    levels = []
    current_width = width
    current_height = height
    for level in range(num_levels):
        a_min = center_a - current_width / 2
        a_max = center_a + current_width / 2
        b_min = center_b - current_height / 2
        b_max = center_b + current_height / 2
        levels.append((a_min, a_max, b_min, b_max, level))
        current_width *= zoom_factor
        current_height *= zoom_factor
    return levels

def main(center_a, center_b, width, height, resolution, num_levels=3, zoom_factor=0.5, n_starts=None, max_steps=1000, max_value=1e6, num_processes=16):
    if n_starts is None:
        n_starts = list(range(1, 101))

    levels = generate_zoom_levels(center_a, center_b, width, height, resolution, num_levels, zoom_factor)

    for a_min, a_max, b_min, b_max, level in levels:
        print(f"Generating zoom level {level}: a [{a_min:.3f}, {a_max:.3f}], b [{b_min:.3f}, {b_max:.3f}]")
        a_range = np.linspace(a_min, a_max, resolution)
        b_range = np.linspace(b_min, b_max, resolution)

        data = generate_phase_data(a_range, b_range, n_starts, max_steps, max_value, num_processes)

        filename = f"1graph_zoom{level+1}_a{round(center_a)}_b{round(center_b)}.png"
        plot_phase_map(data, a_range, b_range, filename)
        print(f"Saved {filename}")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Generate zoomed Collatz fractal images.')
    parser.add_argument('--center_a', type=float, default=2.5, help='Center a value')
    parser.add_argument('--center_b', type=float, default=0.0, help='Center b value')
    parser.add_argument('--width', type=float, default=4.0, help='Initial width for a')
    parser.add_argument('--height', type=float, default=20.0, help='Initial height for b')
    parser.add_argument('--resolution', type=int, default=200, help='Resolution (points per axis)')
    parser.add_argument('--num_levels', type=int, default=3, help='Number of zoom levels')
    parser.add_argument('--zoom_factor', type=float, default=0.5, help='Zoom factor per level')
    parser.add_argument('--max_steps', type=int, default=1000, help='Max steps per orbit')
    parser.add_argument('--max_value', type=float, default=1e6, help='Max value before divergence')
    parser.add_argument('--num_processes', type=int, default=16, help='Number of processes')

    args = parser.parse_args()
    main(args.center_a, args.center_b, args.width, args.height, args.resolution,
         args.num_levels, args.zoom_factor, max_steps=args.max_steps,
         max_value=args.max_value, num_processes=args.num_processes)