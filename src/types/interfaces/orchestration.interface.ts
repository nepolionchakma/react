import { ShapeNode } from "@/pages/Tools/EnterpriseProcessModeler/OrchestrationStudio2/Flow/shape/types";
import { Edge, Node } from "@xyflow/react";
import { SVGAttributes } from "react";

interface Attributes {
  id: number;
  attribute_name: string;
  attribute_value: string;
}

export interface ResizableNodeProps extends Partial<SVGAttributes<SVGElement>> {
  id: string;
  data: {
    label: string;
    attributes: Attributes[];
  };
  isConnectable: boolean;
  selected: boolean;
  positionAbsoluteX: number;
  positionAbsoluteY: number;
}
export interface prop extends Partial<SVGAttributes<SVGElement>> {}

export interface IOrchestrationDataTypes {
  process_id: number;
  process_name: string;
  process_structure: StructureTypes;
}
export interface StructureTypes {
  nodes: Node[];
  edges: Edge[];
}
export type ShapeProps = {
  width: number;
  height: number;
} & SVGAttributes<SVGElement>;

export interface IOrchestrationDataTypes2 {
  process_id: number;
  process_name: string;
  process_structure: StructureTypes2;
}
export interface StructureTypes2 {
  nodes: ShapeNode[];
  edges: Edge[];
}

export interface IdecisionEdgeData {
  fields: [{ label: string; value: string; NodeSourceLabel: string }];
  operators: [{ label: string; value: string }];
}

export interface IProcessExecution {
  def_process_execution_id: number;
  process_id: number | null;
  execution_status: string;
  input_data: any;
  output_data: any;
  error_message: string | null;
  execution_start_date: Date;
  execution_end_date: Date;
  created_by: number;
  creation_date: Date;
  last_updated_by: number;
  last_update_date: Date;
}
