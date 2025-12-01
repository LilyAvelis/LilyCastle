import pickle
import numpy as np
import plotly.graph_objects as go
from skimage import measure
from scipy.ndimage import gaussian_filter

def create_dark_tower_viz(data_file='data_grid_3d.pkl', output_html='1graph_3d_dark_tower.html'):
    print(f"Loading {data_file}...")
    with open(data_file, 'rb') as f:
        data_dict = pickle.load(f)

    a_vals = data_dict['a_vals']
    b_vals = data_dict['b_vals']
    c_vals = data_dict['c_vals']
    data_3d = data_dict['data']

    # We are interested in HIGH values (slow convergence/divergence)
    # The center is around 7.2, max is 9.2. Background is < 2.0.
    # Let's pick thresholds that capture the "structure" of the high values.
    
    # Percentiles for thresholds
    p90 = np.percentile(data_3d, 90) # ~2.17
    p95 = np.percentile(data_3d, 95) # ~2.92
    p99 = np.percentile(data_3d, 99) # ~6.28
    max_val = np.max(data_3d)

    print(f"Thresholds (High values): P90={p90:.2f}, P95={p95:.2f}, P99={p99:.2f}, Max={max_val:.2f}")

    # We will create a few isosurfaces
    # Since Plotly Isosurface can be heavy, let's try Volume or just multiple mesh3d surfaces.
    # Let's stick to the "Blinchiki" style (stacked contours) but for high values, 
    # and maybe add a semi-transparent mesh for the outer shell.

    frames = []
    # Animation over C is good, but maybe we want to see the whole static structure first?
    # The user asked for "Evolution of the center". 
    # Let's make an animation where we slide through C, showing the 2D cross-section of the Dark Tower.
    
    # Actually, the previous viz was "Freezing Threshold Animation".
    # Let's make a "Scanning C Animation" - showing the cross section moving through C.
    
    # Pre-calculate contours for all C
    
    # Let's define a fixed set of levels to visualize the "intensity" of darkness
    levels = [3.0, 5.0, 7.0] 
    colors = ['yellow', 'orange', 'red']
    
    # Create frames for animation over C
    for i, c in enumerate(c_vals):
        data_2d = data_3d[:, :, i]
        data_2d_smooth = gaussian_filter(data_2d, sigma=0.5)
        
        frame_data = []
        
        # Create a heatmap for the background
        # frame_data.append(go.Heatmap(
        #     z=data_2d, x=b_vals, y=a_vals, 
        #     colorscale='Viridis', 
        #     zmin=0, zmax=9,
        #     showscale=False
        # ))
        
        # Add contours for high values
        for level, color in zip(levels, colors):
            contours = measure.find_contours(data_2d_smooth, level)
            for contour in contours:
                y_idx, x_idx = contour.T
                # Map indices to values
                # Note: measure.find_contours returns (row, col) -> (a_idx, b_idx)
                # So x is b_idx, y is a_idx
                
                # Interpolate values
                a_coords = np.interp(y_idx, np.arange(len(a_vals)), a_vals)
                b_coords = np.interp(x_idx, np.arange(len(b_vals)), b_vals)
                
                frame_data.append(go.Scatter(
                    x=b_coords, y=a_coords,
                    mode='lines',
                    line=dict(color=color, width=2),
                    name=f'Level {level}'
                ))
                
        frames.append(go.Frame(data=frame_data, name=f'c={c:.2f}'))

    # Initial frame
    initial_c_idx = 0
    initial_data = frames[initial_c_idx].data

    fig = go.Figure(data=initial_data, frames=frames)

    # Slider for C
    steps = []
    for i, c in enumerate(c_vals):
        step = dict(
            method='animate',
            args=[[f'c={c:.2f}'], dict(mode='immediate', frame=dict(duration=50, redraw=True), transition=dict(duration=0))],
            label=f'{c:.2f}'
        )
        steps.append(step)

    sliders = [dict(
        active=0,
        steps=steps,
        currentvalue={"prefix": "c: "},
        pad={"t": 50}
    )]

    fig.update_layout(
        title='2D Slices of the "Dark Tower" (High Metric Area) scanning through c',
        xaxis_title='b',
        yaxis_title='a',
        sliders=sliders,
        updatemenus=[dict(
            type="buttons",
            buttons=[dict(label="Play",
                          method="animate",
                          args=[None, dict(frame=dict(duration=50, redraw=True), fromcurrent=True)])]
        )],
        template='plotly_dark',
        width=800,
        height=800
    )
    
    # Add a static 3D view as well? 
    # Maybe separate file.
    
    fig.write_html(output_html)
    print(f"Saved animation to {output_html}")

def create_3d_isosurface(data_file='data_grid_3d.pkl', output_html='1graph_3d_dark_isosurface.html'):
    print(f"Loading {data_file}...")
    with open(data_file, 'rb') as f:
        data_dict = pickle.load(f)

    a_vals = data_dict['a_vals']
    b_vals = data_dict['b_vals']
    c_vals = data_dict['c_vals']
    data_3d = data_dict['data']
    
    # Create meshgrid
    B, A, C = np.meshgrid(b_vals, a_vals, c_vals)
    
    fig = go.Figure(data=go.Isosurface(
        x=B.flatten(),
        y=A.flatten(),
        z=C.flatten(),
        value=data_3d.flatten(),
        isomin=3.0,
        isomax=9.0,
        surface_count=5,
        colorscale='Hot',
        caps=dict(x_show=False, y_show=False),
        opacity=0.3
    ))
    
    fig.update_layout(
        title='3D Isosurface of High Metric Values ("Dark Tower")',
        scene=dict(
            xaxis_title='b',
            yaxis_title='a',
            zaxis_title='c'
        ),
        template='plotly_dark'
    )
    
    fig.write_html(output_html)
    print(f"Saved 3D isosurface to {output_html}")

if __name__ == "__main__":
    create_dark_tower_viz()
    create_3d_isosurface()
