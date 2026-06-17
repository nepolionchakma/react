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
  process_id: number;
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

export interface IWorkflowExecutionStep {
  def_execution_step_id: number;
  def_process_execution_id: number;
  node_id: string;
  node_label: string;
  task_name: string;
  status: string;
  input_data: Record<string, any>;
  result: Record<string, any> | null;
  error_message: string | null;
  execution_start_date: Date;
  execution_end_date: Date;
  created_by: number;
  creation_date: Date;
  last_updated_by: number;
  last_update_date: Date;
}

export interface ILookupValue {
  active_yn: "Y" | "N";
  sort_order: number;
  value_code: string;
  description: string;
  value_label: string;
  lookup_value_id: number;
}

export interface ILookup {
  lookup_id: number;
  lookup_code: string;
  lookup_name: string;
  description: string;
  active_yn: "Y" | "N";
  created_by: number;
  creation_date: string;
  last_updated_by: number;
  last_update_date: string;
}
