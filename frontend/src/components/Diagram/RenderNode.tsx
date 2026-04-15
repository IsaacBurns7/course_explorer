import React from "react";
import type { Node, RootNode } from "./types";
import "../../styles/prereqDiagram.css";

type Props = {
  node: Node | RootNode;
  isRootChild?: boolean;  // <── NEW FLAG
  onNodeClick?: (course: string) => void;
};

export function RenderNode({ node, isRootChild = false, onNodeClick }: Props) {

  // ============================
  // ROOT NODE (fixed)
  // ============================
  
  if (node.type === "root") {
    return (
      <div className="node-container">
        <div 
          className={`circle-node ${node.status ?? ""} ${onNodeClick ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}`}
          onClick={() => onNodeClick && onNodeClick(node.courseName)}
        >
          {node.courseName}
        </div>

        {node.children.length > 0 && (
          <div className="root-branch-container">

            <div className="root-vertical" />
            <div className="root-horizontal" />

            <div className="root-children-row">
              {node.children.map((child) => (
                  <div key={child.id} className="root-child">
                  <div className="child-vertical" />
                  <RenderNode node={child} isRootChild={true} onNodeClick={onNodeClick} />  {/* NEW */}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }


  // ===========================================
  // CASE: Root child that is a group → horizontal
  // ===========================================
  if (isRootChild && (node.type === "and" || node.type === "or")) {
  const label = node.type === "and" ? "AND" : "OR";

  return (
    <div className={`group-box ${node.status ?? ""}`}>
      <div className="group-label">{label}</div>

      <div className="root-children-row">
        {node.children.map((child) => (
          <div key={child.id} className="root-child">
            <RenderNode node={child} onNodeClick={onNodeClick} />
          </div>
        ))}
      </div>
    </div>
  );
}



  // ===========================================
  // NORMAL SINGLE-COURSE NODE
  // ===========================================
  if (node.type === "single") {
    const text = node.course.replace(/ (?:(\w)|\^)/g, (_, letter) => {
      if (letter) return `\n( Pass Grade: ${letter} )`;
      return "\n( or Concurrent )";
    });

    return (
      <div className="node-container">
        <div 
          className={`circle-node ${node.status ?? ""} ${onNodeClick ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}`}
          onClick={() => onNodeClick && onNodeClick(node.course)}
        >
          {text}
        </div>
      </div>
    );
  }


  // ===========================================
// Normal non-root AND/OR group nodes (vertical)
// ===========================================
const label = node.type === "and" ? "AND" : "OR";

// Special case: vertical AND chain gets a connector line
if (!isRootChild && node.type === "and") {
  return (
    <div className="node-container">
      <div
        className={`group-box ${node.status ?? ""}`}
      >
        <div className="group-label">{label}</div>

        <div className="group-content">
          {node.children.map((child, index) => (
            <React.Fragment key={child.id}>
              {index > 0 && <div className="child-vertical my-1" />}
              <RenderNode node={child} onNodeClick={onNodeClick} />
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

// normal OR or root-child AND groups (no vertical line)
return (
  <div className="node-container">
    <div className={`group-box ${node.status ?? ""}`}>
      <div className="group-label">{label}</div>

      <div className="group-content">
        {node.children.map((child) => (
          <RenderNode key={child.id} node={child} onNodeClick={onNodeClick} />
        ))}
      </div>
    </div>
  </div>
);

}
