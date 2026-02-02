import { AttributesProps } from "../shape/types";

interface NodeDataProps {
  label: string;
  attributes: AttributesProps[];
  width: number;
  height: number;
}

const NodeData = ({ label, attributes, width, height }: NodeDataProps) => {
  return (
    // <input type="text" className="node-label" placeholder={props.placeholder} />
    <div
      className="node-label px-2 py-2 m-0"
      style={{
        width,
        height,
        alignContent: "center",
      }}
    >
      <h3>{label}</h3>
      <div
        style={{
          alignContent: "center",
        }}
      >
        {attributes.map((attribute) => (
          <div key={attribute.id} className="flex items-center">
            <span className="w-1 h-1 rounded-full mr-1 bg-black"></span>
            <span>{attribute.attribute_value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NodeData;
