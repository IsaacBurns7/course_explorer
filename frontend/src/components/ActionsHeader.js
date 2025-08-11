import { useState, useRef, useContext } from "react";
import { SearchContext } from "../context/search";

function handleSortByName(cards, setCards, professors, ascending, e){
    if(cards === null){
        return;
    }
    if(professors === null){
        return;
    }

    const newCards = [...cards].sort((card1, card2) => {
        const professorId1 = card1.split("_")[2];
        const professorId2 = card2.split("_")[2];
        // if(professorId2 === "info" || professorId1 === "info"){
        //     return -1;
        // }
        const professor1 = professors[professorId1];
        const professor2 = professors[professorId2];
        const professor1Info = professor1.info;
        const professor2Info = professor2.info;
        const name1 = professor1Info.name;
        const name2 = professor2Info.name;
        // console.log(name1, name2);
        // console.log(ascending ? name1.localeCompare(name2) : name2.localeCompare(name1));
        return ascending ? name1.localeCompare(name2) : name2.localeCompare(name1);
    });
    // console.log(cards, newCards);
    setCards(newCards);
}

function handleSortByGrade(cards, setCards, professors, ascending, e){
    if(cards === null){
        return;
    }
    if(professors === null){
        return;
    }
    const newCards = [...cards].sort((card1, card2) => {
        const professorId1 = card1.split("_")[2];
        const professorId2 = card2.split("_")[2];
        // if(professorId1 === "info" || professorId2 === "info") return -1;
        const professor1 = professors[professorId1];
        const professor2 = professors[professorId2];
        const professor1Info = professor1.info;
        const professor2Info = professor2.info;
        const averageGPA1 = professor1Info.averageGPA;
        const averageGPA2 = professor2Info.averageGPA;

        return ascending ? averageGPA1 - averageGPA2 : averageGPA2 - averageGPA1;
    });
    setCards(newCards);
}

function handleSortByRating(cards, setCards, professors, ascending, e){
    if(cards === null){
        return;
    }
    if(professors === null){
        return;
    }
    const newCards = [...cards].sort((card1, card2) => {
        console.log(newCards);
        const professorId1 = card1.split("_")[2];
        const professorId2 = card2.split("_")[2];
        // if(professorId1 === "info" || professorId2 === "info") return -1;
        const professor1 = professors[professorId1];
        const professor2 = professors[professorId2];
        const professor1Info = professor1.info;
        const professor2Info = professor2.info;
        const averageRating1 = professor1Info.averageRating;
        const averageRating2 = professor2Info.averageRating;

        return ascending ? averageRating1 - averageRating2 : averageRating2 - averageRating1;
    });
    setCards(newCards);
}

//ELIMINATE COURSES AND PROFESSORS CONTEXT
//professorcontext - needs a way to map card's professor id -> professorname
//coursescontext 
//  - card {courseNumber + professorId} -> averageGPA + averageRating
function ActionsHeader(){
    const { cards, setCards, professors } = useContext(SearchContext);
    const [nameAscending, setNameAscending] = useState(true);
    const [gradeAscending, setGradeAscending] = useState(true);
    const [ratingAscending, setRatingAscending] = useState(true);

    return (
        <div className = "bg-black text-white grid grid-cols-12 gap-4 font-medium p-4 flex items-center">
            <span className = "col-span-2 text-left items-center ">Actions</span>
            <button className = "col-span-6 text-left"
                onClick = {(e) => {
                    handleSortByName(cards, setCards, professors, nameAscending, e);
                    setNameAscending(!nameAscending);
                }}> 
                <span>Name</span>
                {nameAscending ? <span>↑</span>: <span>↓</span>}
            </button>
            <button className = "col-span-2 text-left"
                onClick = {(e) => {
                    handleSortByGrade(cards, setCards, professors, gradeAscending, e);
                    setGradeAscending(!gradeAscending);
                }}>
                <span>Grades</span>
                {gradeAscending ? <span>↑</span>: <span>↓</span>}
            </button>
            <button className = "col-span-2 text-left"
                onClick = {(e) => {
                    handleSortByRating(cards, setCards, professors, ratingAscending, e);
                    setRatingAscending(!ratingAscending);
                }}
            >
                <span>Rating</span>
                {ratingAscending ? <span>↑</span>: <span>↓</span>}
            </button>
        </div>
    )
}

export default ActionsHeader;