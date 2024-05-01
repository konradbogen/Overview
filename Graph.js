import * as d3 from "d3";
import { useRef, useEffect, useMemo } from "react";

// Define a function to create or update the force-directed graph
function createOrUpdateForceGraph(svg, { nodes, links }) {
  function intern(value) {
    return value; // Placeholder identity function; customize as needed
  }

  const config = {
    // Function to extract unique identifier (node ID)
    nodeId: (d) => d.id,

    // Function to assign node groups (for coloring nodes)
    nodeGroup: (d) => d.group,

    // Array of ordinal values representing the node groups
    nodeGroups: [],

    // Function to extract title for nodes (displayed as tooltip)
    nodeTitle: (d) => `${d.id}\n${d.group}`,

    // Node stroke fill (if not using a group color encoding)
    nodeFill: "white",

    // Node stroke color
    nodeStroke: "transparent",

    // Node stroke width, in pixels
    nodeStrokeWidth: 1.5,

    // Node stroke opacity
    nodeStrokeOpacity: 1,

    // Node radius, in pixels
    nodeRadius: 5,

    // Node strength (for force simulation)
    nodeStrength: 200,

    // Function to extract source node ID for links
    linkSource: ({ source }) => source,

    // Function to extract target node ID for links
    linkTarget: ({ target }) => target,

    // Link stroke color
    linkStroke: "white",

    // Link stroke opacity
    linkStrokeOpacity: 0.6,

    // Function to determine link stroke width
    linkStrokeWidth: (l) => 4,

    // Link stroke linecap
    linkStrokeLinecap: "round",

    // Link strength (for force simulation)
    linkStrength: 2,

    // Array of color strings for the node groups
    colors: d3.schemeTableau10,

    // Outer width of the SVG container, in pixels
    width: window.innerWidth,

    // Outer height of the SVG container, in pixels
    height: window.innerHeight / 2,

    // Promise that resolves to stop the simulation
    invalidation: null,
  };

  // Compute values based on the new data
  const N = d3.map(nodes, config.nodeId).map(intern);
  const LS = d3.map(links, config.linkSource).map(intern);
  const LT = d3.map(links, config.linkTarget).map(intern);

  // Replace the input nodes and links with mutable objects for the simulation.
  const updatedNodes = d3.map(nodes, (_, i) => ({ id: N[i] }));
  const updatedLinks = d3.map(links, (_, i) => ({
    source: LS[i],
    target: LT[i],
  }));

  const simulation = d3
    .forceSimulation(updatedNodes)
    .force(
      "link",
      d3
        .forceLink(updatedLinks)
        .id(({ index: i }) => N[i])
        .distance(100)
    ) // Increase the distance between connected nodes
    .force("charge", d3.forceManyBody().strength(-200))
    .force(
      "center",
      d3.forceCenter(window.innerWidth / 2, window.innerHeight / 4)
    ) // Center force
    .on("tick", ticked)
    .force(
      "x",
      d3.forceX().x((d) => Math.max(0, Math.min(window.innerWidth / 2, d.x)))
    )
    .force(
      "y",
      d3.forceY().y((d) => Math.max(0, Math.min(window.innerHeight / 2, d.y)))
    );

  // Set initial positions of nodes (static)
  nodes.forEach((node) => {
    node.fx = node.x; // Set fixed x-coordinate
    node.fy = node.y; // Set fixed y-coordinate
  });

  // Select or create the link elements
  const link = svg
    .selectAll("line")
    .data(updatedLinks)
    .join("line")
    .attr("stroke", config.linkStroke)
    .attr("stroke-opacity", config.linkStrokeOpacity)
    .attr("stroke-width", config.linkStrokeWidth)
    .attr("marker-end", "url(#arrow)"); // Apply the 'arrow' marker to each link

  // Select or create the node elements
  const node = svg
    .selectAll("circle")
    .data(updatedNodes)
    .join("circle")
    .attr("fill", config.nodeFill)
    .attr("stroke", config.nodeStroke)
    .attr("stroke-opacity", config.nodeStrokeOpacity)
    .attr("stroke-width", config.nodeStrokeWidth)
    .attr("r", config.nodeRadius)
    .call(drag(simulation));

  const text = svg
    .selectAll("text")
    .data(updatedNodes)
    .join("text")
    .text((d) => d.id) // Set text content to node id (or any property you want to display)
    .attr("fill", "white") // Set text color to white
    .attr("font-size", "10px") // Set font size
    .attr("font-weight", "bold") // Set font weight
    .attr("text-anchor", "middle") // Set text anchor to middle for center alignment
    .attr("dy", 7) // Adjust vertical position relative to circle (optional)
    .attr("stroke", "none")
    .attr("stroke-opacity", config.nodeStrokeOpacity)
    .attr("stroke-width", config.nodeStrokeWidth)
    .call(drag(simulation));

  // Update the simulation on each tick
  function ticked() {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
    text.attr("x", (d) => d.x).attr("y", (d) => d.y + 10); // Adjust the vertical position relative to the node (you can modify this value)
  }

  // Drag function to handle node dragging
  function drag(simulation) {
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return d3
      .drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  }

  return { simulation };
}

function addArrowMarkerDefs(svg) {
  // Add arrow marker definition
  svg
    .append("defs")
    .append("marker")
    .attr("id", "arrow")
    .attr("viewBox", "0 0 10 10")
    .attr("refX", 8) // x-coordinate of the arrow point
    .attr("refY", 5) // y-coordinate of the arrow point
    .attr("markerWidth", 10) // width of the arrow
    .attr("markerHeight", 10) // height of the arrow
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,0 L10,5 L0,10 Z") // arrow path
    .attr("fill", "var(--color-secondary)"); // arrow color
}

// Usage within a React component
function Graph({ graphData }) {
  const svgRef = useRef(null);

  // Memoize the graphData to create a stable reference
  const memoizedGraphData = useMemo(() => graphData, [graphData]);

  useEffect(() => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      addArrowMarkerDefs(svg);

      // Create or update the force-directed graph
      const { simulation } = createOrUpdateForceGraph(svg, memoizedGraphData);

      // Clean up the simulation when component unmounts
      return () => {
        simulation.stop();
      };
    }
  }, [memoizedGraphData]);

  return (
    <div
      style={{
        width: "100%",
        height: "50vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <svg ref={svgRef} width="100%" height="100%">
        {/* SVG content will be rendered here */}
      </svg>
    </div>
  );
}

export default Graph;
