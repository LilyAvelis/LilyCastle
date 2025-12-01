import numpy as np
import pickle
import plotly.graph_objects as go

def create_3d_slices_animation(data_file='data_grid_3d.pkl', output_html='1graph_3d_slices_animation.html'):
    with open(data_file, 'rb') as f:
        data_dict = pickle.load(f)

    a_vals = data_dict['a_vals']
    b_vals = data_dict['b_vals']
    c_vals = data_dict['c_vals']
    data_3d = data_dict['data']  # shape (len(a_vals), len(b_vals), len(c_vals))

    A, B = np.meshgrid(a_vals, b_vals, indexing='ij')
    A = A.flatten()
    B = B.flatten()

    frames = []
    for i, c in enumerate(c_vals):
        data_slice = data_3d[:, :, i].flatten()
        frame = go.Frame(
            data=[go.Scatter(
                x=A, y=B,
                mode='markers',
                marker=dict(
                    size=3,
                    color=data_slice,
                    colorscale='Viridis_r',
                    opacity=0.8,
                    colorbar=dict(title='log(steps+1)')
                )
            )],
            name=f'c={c:.2f}'
        )
        frames.append(frame)

    initial_data = data_3d[:, :, 0].flatten()
    fig = go.Figure(
        data=[go.Scatter(
            x=A, y=B,
            mode='markers',
            marker=dict(
                size=3,
                color=initial_data,
                colorscale='Viridis_r',
                opacity=0.8,
                colorbar=dict(title='log(steps+1)')
            )
        )],
        frames=frames
    )

    steps = []
    for i, c in enumerate(c_vals):
        step = dict(
            method='animate',
            args=[[f'c={c:.2f}'], dict(mode='immediate', frame=dict(duration=300, redraw=True), transition=dict(duration=300))],
            label=f'{c:.2f}'
        )
        steps.append(step)

    sliders = [dict(
        active=0,
        steps=steps,
        currentvalue={"prefix": "c="},
    )]

    fig.update_layout(
        title='Slices Animation from 3D Phase Map (varying c)',
        xaxis_title='a',
        yaxis_title='b',
        sliders=sliders,
        paper_bgcolor='black',
        plot_bgcolor='black',
        font_color='white'
    )

    fig.write_html(output_html)
    print(f"3D slices animation saved to {output_html}")

if __name__ == "__main__":
    create_3d_slices_animation()