import { CoursesActions } from "../context/courses";
import { ProfessorsActions } from "../context/professors";

import { useCardsContext } from "../hooks/cards";
import { useCoursesContext } from "../hooks/courses";
import { useProfessorsContext } from "../hooks/useProfessorsContext";

function addCourse(courseDept, courseNumber){
    const {state: professorsState, dispatch: professorsDispatch} = useProfessorsContext();
    const {state: cardsState, dispatch: cardsDispatch} = useCardsContext();
    const {state: coursesState, dispatch: coursesDispatch} = useCoursesContext();

    // const professorsState = {}; //hypothetical backend API call
    // const courseState = {}; //hypothetical backend API call
    // const cardsContext = {}; //just do this yourself from provided arguments, and professorsState

    //do I want an additional context for graphs? 

    const newCourses = {
        //Key: {dept}{number}
        "CSCE120": {
            info: {

            },
            //Key: professorId
            "professorId1": {
                
                //Key: {timeOfYear} {year}
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

    const newCards = {
        professors: [
            "professorId1",
            "professorId2"
        ],
        courses: [
            "DEPT123"
        ],
    };
    const defaultSearchOptions = {
        minGPA: 3.00,
        minRating: 3.00,
        teachingNextSemester: false,
        semesters: [
            "FALL 2024",
            "SPRING 2025",
            "SUMMER 2025"
        ]
    }

    professorsDispatch({type: ProfessorsActions.ADD_PROFESSORS, payload: newProfessors});
    coursesDispatch({type: CoursesActions.ADD_COURSES, payload: newCourses});
    cardsDispatch({type: "ADD_CARDS", payload: newCards});
    //search options is default, don't update context
}

export default addCourse;