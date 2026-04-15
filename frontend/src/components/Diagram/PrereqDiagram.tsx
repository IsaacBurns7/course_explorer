import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
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

  const [root, setRoot] = useState<Node | RootNode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [testLayer, setTestLayer] = useState<string[]>([]);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  
  // Track previous course to avoid flashing on test clicks
  const [prevCourse, setPrevCourse] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!effectiveCourse) return;

    if (effectiveCourse !== prevCourse) {
      setRoot(null);
      setTestLayer([]);
      setPrevCourse(effectiveCourse);
    }

    async function load() {
      try {
        setError(null);

        // 1. Dynamically read user's specific progress from browser's LocalStorage!
        let taken: string[] = [];
        try {
          const stored = localStorage.getItem("academicPlanner");
          if (stored) {
            const planner = JSON.parse(stored);
            Object.values(planner).forEach((semesterClasses: any) => {
              if (Array.isArray(semesterClasses)) {
                semesterClasses.forEach((cls: any) => {
                  const dept = cls?.department || cls?.info?.department;
                  const num = cls?.number || cls?.info?.number;
                  
                  if (dept && num) {
                    taken.push(`${dept}_${num} A`);
                    taken.push(`${dept}${num} A`);
                  } else if (cls?.info?.id) {
                    // Fallback to checking id field
                    taken.push(`${cls.info.id} A`);
                    taken.push(`${cls.info.id.replace("_", "")} A`);
                  }
                });
              }
            });
          }
        } catch (e) {
          console.error("Failed to parse academicPlanner from local storage", e);
        }

        /* Fetch the evaluated tree from the backend via POST */
        const res = await fetch(`/server/api/prereqs/${effectiveCourse}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            taken: [...taken, ...testLayer],
            enrolled: []
          }),
        });
        
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
  }, [effectiveCourse, prevCourse, testLayer]);

  const handleNodeClick = useCallback((courseString: string) => {
    // raw courseString is e.g. "CSCE 120 ^" or "CSCE 120"
    const parsedRaw = courseString.replace(/\s+|\^/g, "").toUpperCase(); 
    // This gives "CSCE120". We append " A" so the backend considers it passed.
    const testCourseFormatted = `${parsedRaw} A`;

    setTestLayer((prev) => {
      if (prev.includes(testCourseFormatted)) {
        return prev.filter((c) => c !== testCourseFormatted);
      }
      return [...prev, testCourseFormatted];
    });
  }, []);

  if (error) return <div className="p-8 text-red-500 font-bold bg-red-50 border border-red-200 rounded-md">Error: {error}</div>;
  if (!root) return <div className="p-8 animate-pulse text-gray-500 italic">Preparing Diagram...</div>;

  if (isCollapsed) {
    return (
      <div className="flex justify-end py-2 shrink-0 my-2">
        <button 
          onClick={() => setIsCollapsed(false)}
          className="bg-background border border-dark-border text-beige-light hover:text-white px-4 py-2 rounded-xl text-sm font-medium shadow transition flex items-center gap-2"
        >
          <span>Expand Diagram</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
      </div>
    );
  }

  return (
    <div className="py-4 flex flex-col relative transition-all duration-300">
      <div className="absolute top-0 right-0 z-10 hidden md:flex">
        <button 
          onClick={() => setIsCollapsed(true)}
          className="bg-background border border-dark-border text-beige-light hover:text-white px-3 py-1.5 rounded-xl text-sm font-medium shadow transition flex items-center gap-2"
        >
          <span>Collapse Diagram</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
      </button>
      </div>

      <div className="flex-grow pb-12 mt-4">
        <RenderNode node={root} onNodeClick={handleNodeClick} />
      </div>

      <div className="mt-8 bg-dark-card border border-dark-border p-4 rounded-lg shadow-lg flex items-start space-x-4">
        <div className="text-blue-400 mt-1">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <h4 className="text-white font-medium mb-1">Interactive Diagram Logic</h4>
          <p className="text-gray-300 text-sm">
            This diagram automatically evaluates prerequisites against the history stored in your{" "}
            <Link to="/planner" className="text-blue-400 hover:text-blue-300 underline font-medium">
              Academic Planner
            </Link>
            . Want to see how a course affects your degree plan? Just tap on any circle to temporarily simulate taking that class!
          </p>
          {testLayer.length > 0 && (
            <div className="mt-2 text-xs text-blue-300 flex items-center">
              <span className="font-semibold mr-2">Simulated Classes:</span> 
              {testLayer.map(c => c.replace(" A", "")).join(", ")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
