import { useEffect, useState } from "react";
import { parsePrereqs } from "./diagram_parser";
import { evaluateTree } from "./evaluateTree";
import { RenderNode } from "./RenderNode";
import type { Node, RootNode } from "./types";

/**
 * @param course string
 *
 * department in all caps; underscore between code/number and department;
 *
 * ```ts
 * ex: "ECEN_403"
 * ```
 */
export default function PrereqDiagram({ course }: { course: string }) {
  const [root, setRoot] = useState<Node | null>(null);

  useEffect(() => {
    async function load() {
      /*TODO: CREATE A VALID FETCH POINT FOR THE JSONs*/
      const prereqJson = await fetch("/data_Spring2026_Prereq_test.json").then(
        (r) => r.json()
      );
      /*{"taken": [...], "enrolled": [...]}*/
      const takenJson = await fetch("/coursesTaken.json").then((r) => r.json());

      const prereqs = prereqJson[course].info.prereqs;

      const parsedTree = parsePrereqs(prereqs);
      const evaluated = evaluateTree(
        parsedTree,
        takenJson.taken,
        takenJson.enrolled
      );
      const childrenToUse =
        evaluated.type === "and" ? evaluated.children : [evaluated];

      const rootWrapped: RootNode = {
        type: "root",
        id: "root-" + (evaluated.id ?? "0"),
        courseName: course.replace("_", " "),
        status: evaluated.status,
        children: childrenToUse,
      };

      setRoot(rootWrapped);
    }

    load();
  }, []);

  if (!root) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <RenderNode node={root} />
    </div>
  );
}
