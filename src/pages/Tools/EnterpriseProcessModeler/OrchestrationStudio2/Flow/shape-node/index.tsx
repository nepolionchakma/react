import {
  NodeResizer,
  type NodeProps,
  useStore,
  Handle,
  Position,
  useKeyPress,
  useReactFlow,
} from "@xyflow/react";

import Shape from "../shape";
import ShapeNodeToolbar from "../toolbar";
import { type ShapeNode } from "../shape/types";
import NodeData from "./label";
// import { useMemo } from "react";

// this will return the current dimensions of the node (measured internally by react flow)
function useNodeDimensions(id: string) {
  const node = useStore((state) => state.nodeLookup.get(id));
  return {
    width: node?.measured?.width || 0,
    height: node?.measured?.height || 0,
  };
}

function ShapeNode({ id, selected, data }: NodeProps<ShapeNode>) {
  const { label, attributes, color, type, edge_connection_position } = data;
  const { setNodes } = useReactFlow();
  const { width, height } = useNodeDimensions(id);
  const shiftKeyPressed = useKeyPress("Shift");
  // const handleStyle = { backgroundColor: color };

  const onColorChange = (color: string) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              color,
            },
          };
        }

        return node;
      })
    );
  };
  // const renderHandles = useMemo(() => {
  //   const handles: JSX.Element[] = [];
  //   edge_connection_position?.forEach((position: string) => {
  //     handles.push(
  //       <Handle
  //         key={position.toLowerCase()}
  //         style={{ backgroundColor: color }}
  //         id={position.toLowerCase()}
  //         type="source"
  //         position={Position[position as keyof typeof Position]}
  //       />
  //     );
  //   });
  //   console.log(handles, "handles");
  //   return handles;
  // }, [color, edge_connection_position]);

  return (
    <>
      <ShapeNodeToolbar onColorChange={onColorChange} activeColor={color} />
      <NodeResizer
        color={color}
        keepAspectRatio={shiftKeyPressed}
        isVisible={selected}
      />
      <Shape
        type={type}
        width={width}
        height={height}
        fill={color}
        strokeWidth={2}
        stroke={color}
        fillOpacity={0.8}
      />
      {type === "Start" ? (
        <Handle
          style={{ backgroundColor: color }}
          id="bottom"
          type="source"
          position={Position.Bottom}
        />
      ) : type === "Stop" ? (
        <Handle
          style={{ backgroundColor: color }}
          id="top"
          type="target"
          position={Position.Top}
        />
      ) : (
        <>
          {edge_connection_position?.map((posStr) => {
            const positionEnum = Position[posStr as keyof typeof Position];

            return (
              <Handle
                key={posStr}
                style={{ backgroundColor: color }}
                id={posStr.toLowerCase()}
                type="source"
                position={positionEnum}
              />
            );
          })}
        </>
      )}
      <NodeData label={label} attributes={attributes} />
    </>
  );
}

export default ShapeNode;
