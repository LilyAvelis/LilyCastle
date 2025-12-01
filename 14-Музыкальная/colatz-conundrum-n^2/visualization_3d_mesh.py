import numpy as np
import pickle
import pyvista as pv
import plotly.graph_objects as go

def create_3d_mesh(data_file='data_grid_3d.pkl', output_html='1graph_3d_mesh.html', isosurface_value=None):
    with open(data_file, 'rb') as f:
        data_dict = pickle.load(f)

    a_vals = data_dict['a_vals']
    b_vals = data_dict['b_vals']
    c_vals = data_dict['c_vals']
    data_3d = data_dict['data']

    # Create 3D grid
    grid = pv.ImageData()
    grid.dimensions = np.array(data_3d.shape) + 1
    grid.spacing = (a_vals[1] - a_vals[0], b_vals[1] - b_vals[0], c_vals[1] - c_vals[0])
    grid.origin = (a_vals[0], b_vals[0], c_vals[0])
    grid.cell_data['values'] = data_3d.flatten(order='F')

    # Convert to point data
    grid = grid.cell_data_to_point_data()

    # Isosurface: use percentile if not specified
    if isosurface_value is None:
        isosurface_value = np.percentile(data_3d, 10)  # Lower 10% for very "cold" areas

    # Generate isosurface
    mesh = grid.contour([isosurface_value])

    # Convert to plotly
    vertices = mesh.points
    faces = mesh.faces.reshape(-1, 4)[:, 1:]  # Remove n_vertices per face

    fig = go.Figure(data=[go.Mesh3d(
        x=vertices[:, 0],
        y=vertices[:, 1],
        z=vertices[:, 2],
        i=faces[:, 0],
        j=faces[:, 1],
        k=faces[:, 2],
        color='lightblue',
        opacity=0.8
    )])

    fig.update_layout(
        title=f'3D Mesh of Cold Areas (Isosurface at {isosurface_value:.2f})',
        scene=dict(
            xaxis_title='a',
            yaxis_title='b',
            zaxis_title='c',
            bgcolor='black',
            xaxis=dict(showbackground=False, showgrid=False, zeroline=False),
            yaxis=dict(showbackground=False, showgrid=False, zeroline=False),
            zaxis=dict(showbackground=False, showgrid=False, zeroline=False)
        ),
        paper_bgcolor='black',
        font_color='white'
    )

    fig.write_html(output_html)
    print(f"3D mesh saved to {output_html}")

if __name__ == "__main__":
    create_3d_mesh()