import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { RenderNode } from "./RenderNode";
import type { Node, RootNode } from "./types";

/**
 * @param course string (optional)
 *
 * department in all caps; underscore between code/number and department;
 *
 * ```ts
 * ex: "ECEN_403"
 * ```
 */
export default function PrereqDiagram({ course }: { course?: string }) {
  const { courseId } = useParams();
  const effectiveCourse = course || courseId;

  const [root, setRoot] = useState<Node | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!effectiveCourse) return;

    async function load() {
      try {
        setRoot(null);
        setError(null);

        /* Fetch the evaluated tree from the backend */
        const res = await fetch(`/server/api/prereqs/${effectiveCourse}`);
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || "Could not fetch prerequisite tree from backend");
        }
        
        const rootWrapped: RootNode = await res.json();
        
        setRoot(rootWrapped);
      } catch (err: any) {
        console.error("PrereqDiagram error:", err);
        setError(err.message || "An unknown error occurred loading the diagram.");
      }
    }

    load();
  }, [effectiveCourse]);

  if (error) return <div className="p-8 text-red-500 font-bold bg-red-50 border border-red-200 rounded-md">Error: {error}</div>;
  if (!root) return <div className="p-8 animate-pulse text-gray-500 italic">Preparing Diagram...</div>;

  return (
    <div className="p-8">
      <RenderNode node={root} />
    </div>
  );
}
