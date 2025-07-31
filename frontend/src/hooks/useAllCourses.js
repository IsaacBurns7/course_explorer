import axios from "axios";

let coursePromise = null;
let cachedCourses = null;

export function getAllCourses() {
  if (cachedCourses) {
    return Promise.resolve(cachedCourses);
  }

  if (!coursePromise) {
    coursePromise = axios.get("/server/api/courses/getAll")
      .then(response => {
        if (!response || !response.data) {
          throw new Error("Invalid response structure");
        }

        const allCourses = response.data.map(course =>
          course.replace("_", " ")
        );

        // Convert to a Set if needed
        cachedCourses = new Set(allCourses);
        return cachedCourses;
      })
      .catch(error => {
        coursePromise = null; // allow retry if failed
        console.error("error: ", error)
      });
  }

  return coursePromise;
}