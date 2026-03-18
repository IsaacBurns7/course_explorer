import type { Node, RootNode } from "./types";
import "../../styles/PrereqDiagram.css";

type Props = {
  node: Node | RootNode;
  isRootChild?: boolean;  // <── NEW FLAG
};

export function RenderNode({ node, isRootChild = false }: Props) {

  // ============================
  // ROOT NODE (fixed)
  // ============================
  
  if (node.type === "root") {
    return (
      <div className="node-container">
        <div className={`circle-node ${node.status ?? ""}`}>
          {node.courseName}
        </div>

        {node.children.length > 0 && (
          <div className="root-branch-container">

            <div className="root-vertical" />
            <div className="root-horizontal" />

            <div className="root-children-row">
              {node.children.map((child, i) => (
                <div key={i} className="root-child">
                  <div className="child-vertical" />
                  <RenderNode node={child} isRootChild={true} />  {/* NEW */}
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
        {node.children.map((child, i) => (
          <div key={i} className="root-child">
            <RenderNode node={child} />
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
      if (letter) return `\n| Pass Grade: ${letter} |`;
      return "\n| or Concurrent |";
    });

    return (
      <div className="node-container">
        <div className={`circle-node ${node.status ?? ""}`}>{text}</div>
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
        style={{ position: "relative" }}
      >
        <div className="group-label">{label}</div>

        {/* vertical line connecting children */}
        <div className="and-connector-line" />

        <div className="group-content">
          {node.children.map((child, i) => (
            <RenderNode key={i} node={child} />
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
        {node.children.map((child, i) => (
          <RenderNode key={i} node={child} />
        ))}
      </div>
    </div>
  </div>
);

}
