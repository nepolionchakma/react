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
import { Play, StopCircle } from "lucide-react";
import { tailspin } from "ldrs";

// this will return the current dimensions of the node (measured internally by react flow)
function useNodeDimensions(id: string) {
  const node = useStore((state) => state.nodeLookup.get(id));
  return {
    width: node?.measured?.width || 0,
    height: node?.measured?.height || 0,
  };
}

interface ShapeNodeProps extends NodeProps<ShapeNode> {
  handleStartFlow?: () => Promise<void>;
  isLoading?: boolean;
}

function ShapeNode({
  id,
  selected,
  data,
  handleStartFlow,
  isLoading,
}: ShapeNodeProps) {
  const { label, attributes, color, type, edge_connection_position, status } =
    data;
  const { setNodes } = useReactFlow();
  const { width, height } = useNodeDimensions(id);
  const shiftKeyPressed = useKeyPress("Shift");
  tailspin.register();
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
      }),
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

  // Status indicator style

  const statusStyle = {
    position: "absolute" as const,
    right: "-150%", // Position to the left of the node
    top: "20%",
    transform: "translateY(-50%)",
    backgroundColor: "#f8f9fa",
    padding: "1px 2px",
    borderRadius: "4px",
    border: "1px solid #dee2e6",
    fontSize: "12px",
    // minWidth: "36px",
    textAlign: "center" as const,
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    zIndex: 10,
    overFlow: "hidden",
  };

  // Status color based on status
  const getStatusColor = (status?: string) => {
    if (!status) return "#6c757d"; // Default gray
    switch (status.toLowerCase()) {
      case "passed":
        return "#28a745";
      case "completed":
        return "#28a745";
      case "failed":
        return "#dc3545";
      case "running":
        return "#ffc107";
      case "pending":
        return "#17a2b8";
      default:
        return "#6c757d";
    }
  };

  const formatResult = (result: any) => {
    if (result === null || result === undefined) {
      return "";
    }

    if (typeof result === "object") {
      if (Array.isArray(result)) {
        return result.join(", ");
      }
      return Object.entries(result)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ");
    }

    return String(result);
  };

  return (
    <>
      <ShapeNodeToolbar onColorChange={onColorChange} activeColor={color} />
      <NodeResizer
        color={color}
        keepAspectRatio={shiftKeyPressed}
        isVisible={selected}
      />
      {/* Start and Stop flow function */}
      {selected && (
        <div className="absolute -top-7 z-50">
          {type === "Start" ? (
            <>
              {isLoading ? (
                <l-tailspin
                  size="20"
                  stroke="3"
                  speed="1"
                  color="green"
                ></l-tailspin>
              ) : (
                <Play
                  size={20}
                  className="cursor-pointer"
                  color="green"
                  onClick={handleStartFlow}
                />
              )}
            </>
          ) : type === "Stop" && isLoading ? (
            <StopCircle color="red" className="cursor-pointer" />
          ) : null}
        </div>
      )}

      {/* Status Indicator */}
      {status?.status && selected && (
        <div style={statusStyle}>
          <div
            style={{
              color: getStatusColor(status.status),
              fontWeight: "bold",
              marginBottom: "2px",
              fontSize: "10px",
              padding: "2px 3px",
            }}
          >
            {status.status}
          </div>

          {status.result && (
            <div
              style={{
                color: "#212529",
                fontSize: "10px",
                wordBreak: "break-word",
                maxWidth: "100px",
                maxHeight: "80px",
                overflow: "auto",
                textOverflow: "ellipsis",
                padding: "2px 3px",
              }}
            >
              {formatResult(status.result)}
            </div>
          )}
        </div>
      )}
      <Shape
        type={type}
        width={width}
        height={height}
        fill={color}
        strokeWidth={2}
        stroke={color}
        fillOpacity={0.8}
        status={{ status: status?.status }}
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
      <NodeData
        label={label}
        attributes={attributes}
        width={width}
        height={height}
      />
    </>
  );
}

export default ShapeNode;
