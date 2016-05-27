# Plotting Time Series Data From Protein Simulations Using Time Curves 

[Link] (http://cse512-16s.github.io/fp-arushiprakash/) to website

## Data Domain  
  This data come from a protein simulation - 4 LK-alpha 14 proteins (shown below) in water (not shown). The size of the proteins (radius of gyration), inter-protein distances, energy and other association parameters have been tracked during the simulation. This data usually fluctuates (a lot) within a range and occasionally jumps to a new state or value. Fluctuations capture the stability of the system and jumps are important to track rare-events in the simulations.  
  <img src="lib/protein_image.png" width="500" height="500">  
  
  The time series data - usually energy, length of protein, distance from reference particle - is uploaded to the plotting engine. Each data point is placed on the plot at some relative distance to other points depending on their closeness with respect to a set of variables. For example, when we plot energy, two points with similar energy are plotted close together. When we plot Energy & Distance, two points with a similar combination of both variables are near each other. The line color tells the reader if the event occurs earlier or later in time - light colors for earlier time. Similar points are colored in the same color to make the graph easily readable. There are **six main forms of interaction**:  
  
* Bring your mouse over to the circle to see the data point it represents  
* Click on a circle to bring up the 3D structure that represents the point
* Rotate or zoom the structure to view it from different angles
* Radio buttons to select number of variables for plotting - select the variables you want to cluster   
* Drop down menus to select the variables of interest
* Color different atoms of the from the drop down menu

### Please allow time for each 3d structure to load!
