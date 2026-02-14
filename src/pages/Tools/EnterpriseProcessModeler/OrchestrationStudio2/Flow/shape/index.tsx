import {
  ShapeComponents,
  type ShapeComponentProps,
  type NodeStatus,
} from "./types";
import { useEffect, useRef } from "react";

// CSS for the loading animation
const loadingAnimation = `
  @keyframes dash {
    to {
      stroke-dashoffset: -20;
    }
  }

  .shape-loading {
    stroke-dasharray: 5, 5;
    animation: dash 1s linear infinite;
  }
`;

// Add the styles to the document head if they don't exist
const addStyles = () => {
  if (!document.getElementById("shape-status-styles")) {
    const style = document.createElement("style");
    style.id = "shape-status-styles";
    style.textContent = loadingAnimation;
    document.head.appendChild(style);
  }
};

function Shape({
  type,
  width,
  height,
  status,
  ...svgAttributes
}: ShapeComponentProps & { status?: NodeStatus }) {
  const ShapeComponent = ShapeComponents[type];

  if (!ShapeComponent || !width || !height) {
    return null;
  }

  const strokeWidth = svgAttributes.strokeWidth
    ? +svgAttributes.strokeWidth
    : 0;

  // we subtract the strokeWidth to make sure the shape is not cut off
  // this is done because svg doesn't support stroke inset (https://stackoverflow.com/questions/7241393/can-you-control-how-an-svgs-stroke-width-is-drawn)
  const innerWidth = width - 2 * strokeWidth;
  const innerHeight = height - 2 * strokeWidth;

  // Set up the stroke color and class based on status
  const getStatusStyles = () => {
    if (!status) return {};

    switch (status.status) {
      case "RUNNING":
        return {
          className: "shape-loading",
          stroke: svgAttributes.stroke || svgAttributes.fill || "#000000",
          strokeWidth: svgAttributes.strokeWidth || 2,
        };
      case "passed":
        return {
          stroke: "#10B981", // green-500
          strokeWidth: svgAttributes.strokeWidth || 2,
        };
      case "completed":
        return {
          stroke: "#10B981", // green-500
          strokeWidth: svgAttributes.strokeWidth || 2,
        };
      case "failed":
        return {
          stroke: "#EF4444", // red-500
          strokeWidth: svgAttributes.strokeWidth || 2,
        };
      default:
        return {};
    }
  };

  const statusStyles = getStatusStyles();
  const shapeRef = useRef<SVGGElement>(null);

  // Add styles to the document head on component mount
  useEffect(() => {
    addStyles();
  }, []);

  return (
    <svg width={width} height={height} className="shape-svg">
      {/* this offsets the shape by the strokeWidth so that we have enough space for the stroke */}
      <g
        ref={shapeRef}
        transform={`translate(${svgAttributes.strokeWidth ?? 0}, ${
          svgAttributes.strokeWidth ?? 0
        })`}
      >
        <ShapeComponent
          width={innerWidth}
          height={innerHeight}
          {...svgAttributes}
          {...statusStyles}
        />
      </g>
    </svg>
  );
}

export default Shape;
