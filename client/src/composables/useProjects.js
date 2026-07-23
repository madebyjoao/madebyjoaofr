import { ref } from "vue";
import api from "@/lib/api";


const projects = ref(null);
const error = ref(null);
let started = false;

export function useProjects() {
  if (!started) {
    started = true;
    api
      .get("/projects")
      .then(({ data }) => (projects.value = data.projects))
      .catch(() => (error.value = "Impossible de charger les projets."));
  }
  return { projects, error };
}