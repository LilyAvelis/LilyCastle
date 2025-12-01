import numpy as np
import pickle
import plotly.graph_objects as go

def create_animation(data_file, output_html='1graph_animation.html'):
    with open(data_file, 'rb') as f:
        data_dict = pickle.load(f)

    a_vals = data_dict['a_vals']
    b_vals = data_dict['b_vals']
    c_values = data_dict['c_values']
    data_frames = data_dict['data_frames']

    A, B = np.meshgrid(a_vals, b_vals, indexing='ij')
    A = A.flatten()
    B = B.flatten()

    frames = []
    for c in c_values:
        data = data_frames[c].flatten()
        frame = go.Frame(
            data=[go.Scatter(
                x=A, y=B,
                mode='markers',
                marker=dict(
                    size=3,
                    color=data,
                    colorscale='Viridis_r',
                    opacity=0.8,
                    colorbar=dict(title='log(steps+1)')
                )
            )],
            name=f'c={c:.2f}'
        )
        frames.append(frame)

    initial_data = data_frames[c_values[0]].flatten()
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
    for i, c in enumerate(c_values):
        step = dict(
            method='animate',
            args=[[f'c={c:.2f}'], dict(mode='immediate', frame=dict(duration=300, redraw=True), transition=dict(duration=300))],
            label=f'c={c:.2f}'
        )
        steps.append(step)

    sliders = [dict(
        active=0,
        steps=steps,
        currentvalue={"prefix": "c="},
    )]

    fig.update_layout(
        title='Animation of Phase Maps for Quadratic Collatz (varying c)',
        xaxis_title='a',
        yaxis_title='b',
        sliders=sliders
    )

    fig.write_html(output_html)
    print(f"Animation saved to {output_html}")

if __name__ == "__main__":
    create_animation('data_animation.pkl')