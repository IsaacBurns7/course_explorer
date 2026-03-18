export type NodeStatus = "met" | "needed";

export interface SingleNode {
  type: "single";
  id: string;
  course: string;
  status?: NodeStatus;
}

export interface AndNode {
  type: "and";
  id: string;
  children: Node[];
  status?: NodeStatus;
}

export interface OrNode {
  type: "or";
  id: string;
  children: Node[];
  status?: NodeStatus;
}

export interface RootNode {
  type: "root";
  id: string;
  courseName: string;
  children: Node[];
  status?: NodeStatus;
}


export type Node = SingleNode | AndNode | OrNode | RootNode;
