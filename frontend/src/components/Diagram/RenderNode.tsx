import React from "react";
import type { Node, RootNode } from "./types";
import "../../styles/prereqDiagram.css";

type Props = {
  node: Node | RootNode;
  isRootChild?: boolean;  // <── NEW FLAG
  onNodeClick?: (course: string) => void;
  isAncestorMet?: boolean;
};

export function RenderNode({ node, isRootChild = false, onNodeClick, isAncestorMet = false }: Props) {
  let effectiveStatus = node.status ?? "";
  if (effectiveStatus === "needed" && isAncestorMet) {
    effectiveStatus = "extra";
  }
  
  const childAncestorMet = isAncestorMet || node.status === "met";

  // ============================
  // ROOT NODE (fixed)
  // ============================
  
  if (node.type === "root") {
    return (
      <div className="node-container">
        <div 
          className={`circle-node ${effectiveStatus} ${onNodeClick ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}`}
          onClick={() => onNodeClick && onNodeClick((node as any).originalCourseName || node.courseName)}
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
                  <RenderNode node={child} isRootChild={true} onNodeClick={onNodeClick} isAncestorMet={childAncestorMet} />  {/* NEW */}
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
    <div className={`group-box ${effectiveStatus}`}>
      <div className="group-label">{label}</div>

      <div className="root-children-row">
        {node.children.map((child) => (
          <div key={child.id} className="root-child">
            <RenderNode node={child} onNodeClick={onNodeClick} isAncestorMet={childAncestorMet} />
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
    const text = node.course.replace(/ (?:(\w+)|\^)/g, (_, letter) => {
      if (effectiveStatus === "extra") return ""; // strip requirement rules completely to save space
      if (letter) return `\n( Pass Grade: ${letter} )`;
      return "\n( or Concurrent )";
    });

    return (
      <div className="node-container">
        <div 
          className={`circle-node ${effectiveStatus} ${onNodeClick ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}`}
          onClick={() => onNodeClick && onNodeClick((node as any).originalCourse || node.course)}
        >
          <span>{text}</span>
          {effectiveStatus === "extra" && (
            <span className="flex items-center justify-center gap-1 text-[11px] text-sky-400 mt-1 font-bold z-10 leading-none">
              EXTRA
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 01-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 01-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 01-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584zM12 18a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
              </svg>
            </span>
          )}
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
        className={`group-box ${effectiveStatus}`}
      >
        <div className="group-label">{label}</div>

        <div className="group-content">
          {node.children.map((child, index) => (
            <React.Fragment key={child.id}>
              {index > 0 && <div className="child-vertical my-1" />}
              <RenderNode node={child} onNodeClick={onNodeClick} isAncestorMet={childAncestorMet} />
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
    <div className={`group-box ${effectiveStatus}`}>
      <div className="group-label">{label}</div>

      <div className="group-content">
        {node.children.map((child) => (
          <RenderNode key={child.id} node={child} onNodeClick={onNodeClick} isAncestorMet={childAncestorMet} />
        ))}
      </div>
    </div>
  </div>
);

}
