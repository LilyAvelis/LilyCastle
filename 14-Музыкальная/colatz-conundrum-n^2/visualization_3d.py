import numpy as np
import pickle
import plotly.graph_objects as go

def plot_3d_phase_map(data_file, output_html='1graph_3d_phase_map.html'):
    """
    Load 3D data and plot interactive 3D scatter plot with color by metric using Plotly (GPU-accelerated via WebGL).
    """
    with open(data_file, 'rb') as f:
        data_dict = pickle.load(f)

    a_vals = data_dict['a_vals']
    b_vals = data_dict['b_vals']
    c_vals = data_dict['c_vals']
    data = data_dict['data']

    # Create meshgrid for scatter
    A, B, C = np.meshgrid(a_vals, b_vals, c_vals, indexing='ij')
    A = A.flatten()
    B = B.flatten()
    C = C.flatten()
    values = data.flatten()

    # Downsample for performance (take every 5th point)
    step = 5
    A = A[::step]
    B = B[::step]
    C = C[::step]
    values = values[::step]

    # Size: larger for slower convergence/divergence (higher values)
    sizes = (values + 1) * 0.5  # Scale size proportionally to value

    fig = go.Figure(data=[go.Scatter3d(
        x=A, y=B, z=C,
        mode='markers',
        marker=dict(
            size=sizes,
            color=values,
            colorscale='Viridis_r',  # Reversed: light for low values (fast convergence)
            opacity=0.8,
            colorbar=dict(title='Average log(steps + 1)'),
            sizemode='diameter'  # Size in pixels
        )
    )])

    fig.update_layout(
        title='Interactive 3D Phase Map for Quadratic Collatz (a, b, c)',
        scene=dict(
            xaxis_title='a',
            yaxis_title='b',
            zaxis_title='c',
            bgcolor='black',  # Dark background for scene
            xaxis=dict(showgrid=False, showbackground=False),
            yaxis=dict(showgrid=False, showbackground=False),
            zaxis=dict(showgrid=False, showbackground=False)
        ),
        paper_bgcolor='black',  # Dark background for paper
        font_color='white'  # White text
    )

    fig.write_html(output_html)
    print(f"Interactive 3D plot saved to {output_html}. Open in browser to view with GPU acceleration.")

if __name__ == "__main__":
    plot_3d_phase_map('data_grid_3d.pkl')