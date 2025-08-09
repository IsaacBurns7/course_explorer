/*
this ones pretty simple...
EXAMPLE
(right now does not support multiple classes)
const defaultSearchOptions = {
    minGPA: 3.00,
    minRating: 3.00,
    teachingNextSemester: false,
    semesters: [
        "FALL 2024",
        "SPRING 2025",
        "SUMMER 2025"
    ],
    professors: {
        professorId1:{
            //to make grades work with semesters would require the frontend to handle all sections 
            averageRating: 4.8,
            numRatings: 123, 
            averageGPA: 1,
            numStudents,
            numSections,
            name,
        }
    },
    courses: {
        DEPT_123: {
            professors: [
                id1,
                id2   
            ],
            //^^same is true of these grades variable
            averageGPA,
            averageRating,
            numStudents,
            numRatings,
            numSections
            ?prereqs: []
            ?postreqs: []
        }
    },
    cards: ["DEPT123_id1"] //may not be necessary since this is contained within courses
    // comparedCards: ["DEPT123_id1"] - this could be a separate context ? XD
    graph: {
        "DEPT123_id1": {
            data: [array of data]
            meta: { professorId: '100615', department: 'CSCE', courseNumber: '120'}
            name: "CSCE 120 <professorName>"
        }
    }
}
*/
import { createContext, useReducer, useMemo, useState } from "react"; 

export const SearchContext = createContext();

export const SearchActions = {
    SET_SEARCH_OPTIONS: "SET_SEARCH_OPTIONS"
}

export const SearchContextProvider = ( {children} ) => {
    const [professorFilters, setProfessorFilters] = useState({
        minGPA: 0,
        minRatings: 0,
        teachingNextSemester: false,
        semesters: []
    });
    const [cards, setCards] = useState([]);
    const [courses, setCourses] = useState({});
    const [professors, setProfessors] = useState({});
    const [comparedCards, setComparedCards] = useState([]);
    const [graphData, setGraphData] = useState({});
    const [categories, setCategories] = useState(["A", "B", "C", "D", "F", "I", "S", "U", "Q", "X"]);

    const contextValue = {
        cards,
        professorFilters,
        courses,
        professors,
        comparedCards,
        graphData,
        categories,
    
        setCategories,
        setCards,
        setProfessorFilters,
        setCourses,
        setProfessors,
        setComparedCards,
        setGraphData
    };

    return <SearchContext.Provider value = {contextValue}>
        {children}
    </SearchContext.Provider>
}