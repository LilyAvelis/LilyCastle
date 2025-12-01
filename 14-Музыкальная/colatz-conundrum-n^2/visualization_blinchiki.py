import numpy as np
import pickle
import plotly.graph_objects as go
from skimage import measure

def create_blinchiki_animation(data_file='data_grid_3d.pkl', c_index=25, output_html='1graph_blinchiki.html'):
    with open(data_file, 'rb') as f:
        data_dict = pickle.load(f)

    a_vals = data_dict['a_vals']
    b_vals = data_dict['b_vals']
    c_vals = data_dict['c_vals']
    data_3d = data_dict['data']

    # Select slice for c
    c_value = c_vals[c_index]
    data_2d = data_3d[:, :, c_index]

    # Thresholds for "freezing"
    thresholds = np.linspace(np.min(data_2d), np.max(data_2d), 20)

    frames = []
    for thresh in thresholds:
        # Find contours
        contours = measure.find_contours(data_2d, thresh)

        fig_data = []
        for contour in contours:
            # Convert to plotly coordinates
            y, x = contour.T
            x_plot = a_vals[x.astype(int)]
            y_plot = b_vals[y.astype(int)]
            fig_data.append(go.Scatter(
                x=x_plot, y=y_plot,
                mode='lines',
                line=dict(color='lightblue', width=2),
                fill='toself',
                fillcolor='rgba(173, 216, 230, 0.5)'  # Light blue fill
            ))

        frame = go.Frame(data=fig_data, name=f'thresh={thresh:.2f}')
        frames.append(frame)

    initial_data = []
    for contour in measure.find_contours(data_2d, thresholds[0]):
        y, x = contour.T
        x_plot = a_vals[x.astype(int)]
        y_plot = b_vals[y.astype(int)]
        initial_data.append(go.Scatter(
            x=x_plot, y=y_plot,
            mode='lines',
            line=dict(color='lightblue', width=2),
            fill='toself',
            fillcolor='rgba(173, 216, 230, 0.5)'
        ))

    fig = go.Figure(data=initial_data, frames=frames)

    steps = []
    for i, thresh in enumerate(thresholds):
        step = dict(
            method='animate',
            args=[[f'thresh={thresh:.2f}'], dict(mode='immediate', frame=dict(duration=300, redraw=True), transition=dict(duration=300))],
            label=f'{thresh:.2f}'
        )
        steps.append(step)

    sliders = [dict(
        active=0,
        steps=steps,
        currentvalue={"prefix": "Threshold: "},
    )]

    fig.update_layout(
        title=f'Blinciki for c={c_value:.2f} - Freezing Threshold Animation',
        xaxis_title='a',
        yaxis_title='b',
        sliders=sliders,
        paper_bgcolor='black',
        plot_bgcolor='black',
        font_color='white'
    )

    fig.write_html(output_html)
    print(f'Blinciki animation saved to {output_html}')

if __name__ == "__main__":
    create_blinchiki_animation()