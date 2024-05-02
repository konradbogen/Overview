import React from "react";
import { useRef, useEffect, useMemo } from "react";
import {
  forceSimulation,
  forceCollide,
  forceManyBody,
  forceCenter,
  forceX,
  forceY,
} from "d3-force";
import { randomUniform } from "d3-random";
import { Svg, G, Circle, Text } from "react-native-svg";
import { Dimensions, View, PanResponder } from "react-native";

export default class ForceDiagram extends React.Component {
  constructor(props) {
    super(props);
    const range = 20;
    const width = Dimensions.get("window").width;
    const height = Dimensions.get("window").height;

    this.state = {
      nodes: new Array(range).fill(null).map((d, key) => ({
        r: randomUniform(5, 10)(),
        x: width / 2,
        y: height / 4,
        text: "Bello",
        key,
      })),
      selectedNode: null, // Track the currently selected node
    };

    this.simulation = forceSimulation(this.state.nodes)
      .force(
        "collide",
        forceCollide()
          .radius((d) => d.r + 8)
          .iterations(16)
      )
      .force("charge", forceManyBody().strength(-1))
      .force("center", forceCenter(width / 2, height / 4));
    /*  .force(
        "x",
        forceX().x((d) => Math.max(0, Math.min(width / 2, d.x)))
      )
      .force(
        "y",
        forceY().y((d) => Math.max(0, Math.min(height / 2, d.y)))
      );
 */
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt, gestureState) => {
        const { locationX, locationY } = evt.nativeEvent;

        // Find the node that was touched
        const selectedNode = this.state.nodes.find((node) => {
          const dx = locationX - node.x;
          const dy = locationY - node.y;
          return Math.sqrt(dx * dx + dy * dy) < node.r;
        });

        if (selectedNode) {
          // Set the selected node in the state
          this.setState({ selectedNode });
          this.simulation.alphaTarget(0.3).restart();
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        if (this.state.selectedNode) {
          const { locationX, locationY } = evt.nativeEvent;
          // Update the position of the selected node
          this.state.selectedNode.x = locationX;
          this.state.selectedNode.y = locationY;
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        this.simulation.alphaTarget(0);
        // Clear the selected node from the state
        this.setState({ selectedNode: null });
      },
    });
  }

  componentDidMount() {
    this.simulation.on("tick", () => this.forceUpdate());
  }

  render() {
    console.log("RENDER");
    console.log(this.props.graphData);
    const { width, height } = this.props;
    const { selectedNode } = this.state;
    console.log(nodes);

    return (
      <View {...this.panResponder.panHandlers} style={{ flex: 1 }}>
        <Svg width="100%" height="100%">
          <G>
            {nodes.map((node) => (
              <G>
                <Circle
                  key={node.id}
                  r={node.r}
                  cx={node.x}
                  cy={node.y}
                  fill={node === selectedNode ? "grey" : "white"}
                />
                <Text
                  x={node.x}
                  y={node.y + 20}
                  fill="white"
                  fontSize={10}
                  textAnchor="middle"
                  selectable={false}
                  style={{ userSelect: "none", cursor: "default" }}
                >
                  {node.id}
                </Text>
              </G>
            ))}
          </G>
        </Svg>
      </View>
    );
  }
}
