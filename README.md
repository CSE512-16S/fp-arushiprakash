# A tool for exploratory data analysis of time series data from molecular dynamics simulations 

## Abstract
In this paper, I present a visualization tool for exploring molecular simulation data. This tool addresses the design concern that quantitative data - like energy, distance, and pressure - and structural data are visualized separately and thereby lose context. This tool contains a 3D rendering of the structure at each time step and 2D scatter plot distribution of points denoting relationships between physical data at each time step. This web-based GUI platform for visualizing both types of data will decrease user interface with too many software, decrease scripting time, promote collaboration and increase exposure of data for exploratory analysis. I also tested this tool with domain researchers to understand how they used it and the extensions that they would prefer.

Find the related poster [here] (final/poster-arushi3.pdf)
Find the writeup for hte project [here] (final/paper-arushi3.pdf)
Find a summary image of the tool [here] (final/summary.png)

## Running the web-based tool
[Link] (http://cse512-16s.github.io/fp-arushiprakash/) to the site


## Sample data (used for demo) 
  This data come from a protein simulation - 4 LK-alpha 14 proteins (shown below) in water (not shown). The size of the proteins (radius of gyration), inter-protein distances, energy and other association parameters have been tracked during the simulation. This data usually fluctuates (a lot) within a range and occasionally jumps to a new state or value. Fluctuations capture the stability of the system and jumps are important to track rare-events in the simulations.  
  <img src="lib/protein_image.png" width="500" height="500">  
  
  The time series data - usually energy, length of protein, distance from reference particle - is uploaded to the plotting engine. Each data point is placed on the plot at some relative distance to other points depending on their closeness with respect to a set of variables. For example, when we plot energy, two points with similar energy are plotted close together. When we plot Energy & Distance, two points with a similar combination of both variables are near each other. The line color tells the reader if the event occurs earlier or later in time - light colors for earlier time. Similar points are colored in the same color to make the graph easily readable.
