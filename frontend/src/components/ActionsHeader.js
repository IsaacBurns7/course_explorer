import { useState, useRef } from "react";

import { useCardsContext } from "../hooks/useCardsContext";
import { useProfessorsContext } from "../hooks/useProfessorsContext";
import { useCoursesContext } from "../hooks/useCoursesContext";

function handleSortByName(cards, cardsDispatch, professors, ascending, e){
    if(cards === null){
        return;
    }
    if(professors === null){
        return;
    }

    const newCards = cards.sort((card1, card2) => {
        const professorId1 = card1.split("_")[1];
        if(professorId1 === "info"){
            return -1;
        }
        const professor1 = professors[professorId1];
        const info1 = professor1.info;
        const name1 = info1.name;

        const professorId2 = card2.split("_")[1];
        if(professorId2 === "info"){
            return -1;
        }
        const professor2 = professors[professorId2];
        const info2 = professor2.info;
        const name2 = info2.name;
        return ascending ? name1.localeCompare(name2) : name2.localeCompare(name1);
    });
    cardsDispatch({type: "SET_CARDS", payload: newCards});
}

function handleSortByGrade(cards, cardsDispatch, courses, ascending, e){
    if(cards === null){
        return;
    }
    if(courses === null){
        return;
    }
    const newCards = cards.sort((card1, card2) => {
        const course1Raw = card1.split("_")[0];
        const course2Raw = card2.split("_")[0];
        const course1 = course1Raw.slice(0,4) + " " + course1Raw.slice(4);
        const course2 = course2Raw.slice(0,4) + " " + course2Raw.slice(4);
        const professorId1 = card1.split("_")[1];
        const professorId2 = card2.split("_")[1];
        if(professorId1 === "info" | professorId2 === "info") return -1;
        const averageGPA1 = courses[course1][professorId1].info.averageGPA;
        const averageGPA2 = courses[course2][professorId2].info.averageGPA;

        return ascending ? averageGPA1 - averageGPA2 : averageGPA2 - averageGPA1;
    });
    cardsDispatch({type: "SET_CARDS", payload: newCards});
}

function handleSortByRating(cards, cardsDispatch, courses, ascending, e){
    if(cards === null){
        return;
    }
    if(courses === null){
        return;
    }
    const newCards = cards.sort((card1, card2) => {
        const course1Raw = card1.split("_")[0];
        const course2Raw = card2.split("_")[0];
        const course1 = course1Raw.slice(0,4) + " " + course1Raw.slice(4);
        const course2 = course2Raw.slice(0,4) + " " + course2Raw.slice(4);
        const professorId1 = card1.split("_")[1];
        const professorId2 = card2.split("_")[1];
        if(professorId1 === "info" | professorId2 === "info") return -1;
        const rating1 = courses[course1][professorId1].info.averageRating;
        const rating2 = courses[course2][professorId2].info.averageRating;

        return ascending ? rating1 - rating2 : rating2 - rating1;
    });
    console.log(newCards);
    console.log(courses);
    cardsDispatch({type: "SET_CARDS", payload: newCards});
}

//ELIMINATE COURSES AND PROFESSORS CONTEXT
//professorcontext - needs a way to map card's professor id -> professorname
//coursescontext 
//  - card {courseNumber + professorId} -> averageGPA + averageRating
function ActionsHeader(){
    const { cards, dispatch } = useCardsContext();
    const { professors } = useProfessorsContext(); 
    const { courses } = useCoursesContext();
    const [nameAscending, setNameAscending] = useState(true);
    const [gradeAscending, setGradeAscending] = useState(true);
    const [ratingAscending, setRatingAscending] = useState(true);

    return (
        <div className = "bg-black text-white grid grid-cols-12 gap-4 font-medium p-4 flex items-center">
            <span className = "col-span-2 text-left items-center ">Actions</span>
            <button className = "col-span-6 text-left"
                onClick = {(e) => {
                    handleSortByName(cards, dispatch, professors, nameAscending, e);
                    setNameAscending(!nameAscending);
                }}> 
                <span>Name</span>
                <span> ARROW</span>
            </button>
            <button className = "col-span-1 text-left"
                onClick = {(e) => {
                    handleSortByGrade(cards, dispatch, courses, gradeAscending, e);
                    setGradeAscending(!gradeAscending);
                }}>
                <span>Grades</span>
                <span> ARROW</span>
            </button>
            <button className = "col-span-3 text-left"
                onClick = {(e) => {
                    handleSortByRating(cards, dispatch, courses, ratingAscending, e);
                    setRatingAscending(!ratingAscending);
                }}
            >
                <span>Rating</span>
                <span> ARROW</span>
            </button>
        </div>
    )
}

export default ActionsHeader;