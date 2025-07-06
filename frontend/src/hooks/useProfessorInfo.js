import { CoursesContext } from "../context/courses";
import { useContextSelector } from 'use-context-selector';

export const useProfessorInfo = (courseId, professorId) => {
    const { courses } = useContext(CoursesContext);
    return useContextSelector(courses, (context) => context?.[courseId]?.[professorId]?.info);
} 