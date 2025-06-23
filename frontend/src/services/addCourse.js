import { CoursesActions } from "../context/courses";
import { ProfessorsActions } from "../context/professors";

import { useCardsContext } from "../hooks/useCardsContext";
import { useCoursesContext } from "../hooks/useCoursesContext";
import { useProfessorsContext } from "../hooks/useProfessorsContext";
import { useSearchContext } from "../hooks/useSearchContext"

export const addCourse = (courseDept, courseNumber) => {
    const { dispatch: professorsDispatch } = useProfessorsContext();
    const { dispatch: cardsDispatch } = useCardsContext();
    const { dispatch: coursesDispatch } = useCoursesContext();
    const { state: searchState } = useSearchContext();

    // const newProfessors = {}; //hypothetical backend API call
    // const newCourses = {}; //hypothetical backend API call
    // const newCards = {}; //just do this yourself from provided arguments, and professorsState

    //do I want an additional context for graphs? 

    const newCourses = {
        "CSCE120": {
            info: {

            },
            "professorId1": {
                //info about the professor for this class
                info: {

                },
                "FALL 2024": [
                    //Array of Sections Objects
                    {

                    },
                    {

                    }
                ],
            },
            "professorId2": {
                "FALL 2024": [
                    {

                    },
                    {

                    }
                ]
            }
        }
    };

    const newProfessors = {
        "professorId1": {
            //metadata such as other classes taught, overall ratings, overall gpa, etc
        }
    }

    //display each of these classes
    const newCards = [
        "DEPT123_professorId1",
        "DEPT123_professorId2",
    ];    

    professorsDispatch({type: ProfessorsActions.ADD_PROFESSORS, payload: newProfessors});
    coursesDispatch({type: CoursesActions.ADD_COURSES, payload: newCourses});
    cardsDispatch({type: "ADD_CARDS", payload: newCards});
}
