const axios = require("axios");

import { CoursesActions } from "../context/courses";
import { ProfessorsActions } from "../context/professors";

import { useProfessorsContext } from "./useProfessorsContext";
import { useCardsContext } from "./useCardsContext";
import { useCoursesContext } from "./useCoursesContext";
import { useSearchContext } from "./useSearchContext";

export const useCourseActions = () => {
    const { dispatch: professorsDispatch } = useProfessorsContext();
    const { dispatch: cardsDispatch } = useCardsContext();
    const { dispatch: coursesDispatch } = useCoursesContext();
    const { state: searchState } = useSearchContext();

    const addCourse = (courseDept, courseNumber) => {

        const options = {
            method: "GET",
            url: "http://localhost:4000/api/",
        }
        const newCourses2 = axios(options); 
        // const newProfessors = {}; //hypothetical backend API call
        // const newCards = {}; //just do this yourself from provided arguments, and professorsState
    
        //do I want an additional context for graphs? 
    
        const newCourses = {
            "CSCE 120": {
                info: {
                    averageGPA: 2.65,
                    averageRating: 3.35
                },
                "professorId1": {
                    //info about the professor for this class
                    info: {
                        name: "isaacthedestroyer",
                        averageGPA: 2.65,
                        averageRating: 3.35
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
                    info: {
                        name: "rafaythebloke",
                        averageGPA: 1.25,
                        averageRating: 1.93
                    },
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
                name: "uwuGuy1",
                ratingCount: 30,
                ratingAverage: 4.45,
                gpa: 3.7
            },
            "professorId2": {
                //metadata such as other classes taught, overall ratings, overall gpa, etc
                name: "uwuGuy2",
                ratingCount: 20,
                ratingAverage: 2.45,
                gpa: 2.7
            }
        }
    
        //display each of these classes
        const newCards = [
            "CSCE120_professorId1",
            "CSCE120_professorId2",
        ];   
        // console.log(newProfessors);
        
        professorsDispatch({ type: ProfessorsActions.ADD_PROFESSORS, payload: newProfessors });
        coursesDispatch({ type: CoursesActions.ADD_COURSES, payload: newCourses });
        cardsDispatch({ type: "ADD_CARDS", payload: newCards });

        // console.log(professors);
    };



    return { addCourse };
}