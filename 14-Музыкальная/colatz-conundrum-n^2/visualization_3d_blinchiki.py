import numpy as np
import pickle
import plotly.graph_objects as go
from skimage import measure
from scipy.ndimage import gaussian_filter

def create_3d_blinchiki(data_file='data_grid_3d.pkl', output_html='1graph_3d_blinchiki.html'):
    with open(data_file, 'rb') as f:
        data_dict = pickle.load(f)

    a_vals = data_dict['a_vals']
    b_vals = data_dict['b_vals']
    c_vals = data_dict['c_vals']
    data_3d = data_dict['data']

    # Thresholds
    thresholds = np.linspace(np.min(data_3d), np.max(data_3d), 15)

    frames = []
    for thresh in thresholds:
        fig_data = []
        for i, c in enumerate(c_vals):
            data_2d = data_3d[:, :, i]
            data_2d_smooth = gaussian_filter(data_2d, sigma=1)  # Smooth for better contours
            contours = measure.find_contours(data_2d_smooth, thresh)
            for contour in contours:
                y, x = contour.T
                x_plot = a_vals[x.astype(int)]
                y_plot = b_vals[y.astype(int)]
                z_plot = np.full_like(x_plot, c)
                fig_data.append(go.Scatter3d(
                    x=x_plot, y=y_plot, z=z_plot,
                    mode='lines',
                    line=dict(color='lightblue', width=2)
                ))
        frame = go.Frame(data=fig_data, name=f'thresh={thresh:.2f}')
        frames.append(frame)

    initial_thresh = thresholds[0]
    initial_data = []
    for i, c in enumerate(c_vals):
        data_2d = data_3d[:, :, i]
        data_2d_smooth = gaussian_filter(data_2d, sigma=1)  # Smooth for better contours
        contours = measure.find_contours(data_2d_smooth, initial_thresh)
        for contour in contours:
            y, x = contour.T
            x_plot = a_vals[x.astype(int)]
            y_plot = b_vals[y.astype(int)]
            z_plot = np.full_like(x_plot, c)
            initial_data.append(go.Scatter3d(
                x=x_plot, y=y_plot, z=z_plot,
                mode='lines',
                line=dict(color='lightblue', width=2)
            ))

    fig = go.Figure(data=initial_data, frames=frames)

    steps = []
    for i, thresh in enumerate(thresholds):
        step = dict(
            method='animate',
            args=[[f'thresh={thresh:.2f}'], dict(mode='immediate', frame=dict(duration=0, redraw=True), transition=dict(duration=0))],
            label=f'{thresh:.2f}'
        )
        steps.append(step)

    sliders = [dict(
        active=0,
        steps=steps,
        currentvalue={"prefix": "Threshold: "},
    )]

    fig.update_layout(
        title='3D Blinciki - Freezing Threshold Animation',
        scene=dict(
            xaxis_title='a',
            yaxis_title='b',
            zaxis_title='c',
            bgcolor='black',
            xaxis=dict(showbackground=False, showgrid=False, zeroline=False),
            yaxis=dict(showbackground=False, showgrid=False, zeroline=False),
            zaxis=dict(showbackground=False, showgrid=False, zeroline=False)
        ),
        sliders=sliders,
        paper_bgcolor='black',
        font_color='white'
    )

    fig.write_html(output_html)
    print(f'3D Blinciki animation saved to {output_html}')

if __name__ == "__main__":
    create_3d_blinchiki()