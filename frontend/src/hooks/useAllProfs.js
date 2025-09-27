import axios from "axios";

let profPromise = null;
let cachedProfs = null;

export function getAllProfs() {
  if (cachedProfs) {
    return Promise.resolve(cachedProfs);
  }

  if (!profPromise) {
    profPromise = axios.get("/server/api/professors/getAll")
      .then(response => {
        if (!response || !response.data) {
          throw new Error("Invalid response structure");
        }

        cachedProfs = new Set(response.data);
        return cachedProfs
      })
      .catch(error => {
        profPromise = null; // allow retry if failed
        console.error("error: ", error)
      });
  }

  return profPromise;
}