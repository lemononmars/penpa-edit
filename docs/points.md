# Point data
This document details the format of the different point types. Points are integer where the unit digit is the type of the point. For maximal compability, the following fields must be filled with their respective expected values.
### Type XX0 - Center/Cell
Cells that can be shaded, contain numbers, contain shapes, etc. Assuming the cell is `C`
  Subfield  |      Expected value      
:----------:|:-------------:|
`adjacent` |  Cells that are orthogonally connected to the cell `C`
`adjacent_dia` | Cells that have a vertex in common with `C`, but are not orthogonally adjacent 
`surround` | Vertices that are on the contour of the cell `C`
`neighbor` | Edges that make up the contour of the cell `C`
`edge_to_vertex` | Blank

### Type XX1 - Vertex
Assuming the vertex is `V`
  Subfield  |      Expected value      
:----------:|:-------------:|
`adjacent` |  Opposite endpoints of all edges in `edge_to_vertex`
`adjacent_dia` | Vertices that are part of the contour of the cells around `V`, but are not connected by an edge to `V`
`surround` | Blank
`neighbor` | Cells for which `V` is one of their vertices
`edge_to_vertex` | Edges that are incident to `V`

### Type XX2 - Edge
`type2` may be used for orientation. Assuming the edge is `E`
  Subfield  |      Expected value      
:----------:|:-------------:|
`adjacent` |  Edges that are parallel (or almost) which share a cell with `E`. These are used to draw walls. Usually of the same `type2` as `E` 
`adjacent_dia` | Blank
`surround` | Blank
`neighbor` | Cells for which `E` is one of their edges
`edge_to_vertex` | The vertices at both ends of `E`

### Type XX3 - Corner
These are used for corner numbers and cage. These should usually be defined as a linear combination of a cell and a vertex. Assuming `C` is the corner
  Subfield  |      Expected value      
:----------:|:-------------:|
`adjacent` |  Corners that are either in a different cell than `C` but are neighbor to the same vertex, or corners that are in the same cell as `C`, and are neighbor to a vertex that is adjacent of the vertex of `C`
`adjacent_dia` | Blank
`surround` | Vertex of the cell that contains `C` closest to `C` (if pushed outwards, this would be where `C` ends up)
`neighbor` | Cell that contains `C`
`edge_to_vertex` | Blank

### Type XX4 - Compass
These are used for compass clues, principally. These should usually be defined as a linear combination of a cell and an edge. Assuming `C` is the compass location
  Subfield  |      Expected value      
:----------:|:-------------:|
`adjacent` |  Blank
`adjacent_dia` | Blank
`surround` | Edge of the cell that contains `C` closest to `C` (if pushed outwards, this would be where `C` ends up)
`neighbor` | Cell that contains `C`
`edge_to_vertex` | Blank

## Helper functions
### `get_grouped_types()`
Returns an array of array that returns `[center, vertex, edge, corner, compass]` in that order if the `types` attribute of puzzle has been filled in with all possible types.

### `fix_points(point)`
Build some associations given the following are defined within `point`:
- Vertices and edges' coordinates.
- Cells' `surround` 
- Cells' `neighbor` (there can be incorrect edges, as long as all correct ones are present)

The function will not build cells' `adjacent_dia`, vertices' `adjacent_dia`, edges' `adjacent` and all compass and corner attributes.

### `point_connect_corners()`
Fill in the `adjacent` field of corners. `corner_table`, edges' `edge_to_vertex` and edges' `neighbor` must be filled beforehand.