import { useState, useRef } from "react";

function handleSortByName(cards, cardsDispatch, cardToProfessorInfo, ascending, e){
    if(cards === null){
        return;
    }
    if(cardToProfessorInfo === null){
        return;
    }

    const newCards = cards.sort((card1, card2) => {
        const professorId1 = card1.split("_")[1];
        const professorId2 = card2.split("_")[1];
        if(professorId2 === "info" | professorId1 === "info"){
            return -1;
        }
        const professorInfo1 = cardToProfessorInfo.get(card1);
        const professorInfo2 = cardToProfessorInfo.get(card2);
        const name1 = professorInfo1.name;
        const name2 = professorInfo2.name;
        return ascending ? name1.localeCompare(name2) : name2.localeCompare(name1);
    });
    cardsDispatch({type: "SET_CARDS", payload: newCards});
}

function handleSortByGrade(cards, cardsDispatch, cardToProfessorInfo, ascending, e){
    if(cards === null){
        return;
    }
    if(cardToProfessorInfo === null){
        return;
    }
    const newCards = cards.sort((card1, card2) => {
        const professorId1 = card1.split("_")[1];
        const professorId2 = card2.split("_")[1];
        if(professorId1 === "info" | professorId2 === "info") return -1;
        const averageGPA1 = cardToProfessorInfo.get(card1).averageGPA;
        const averageGPA2 = cardToProfessorInfo.get(card2).averageGPA;

        return ascending ? averageGPA1 - averageGPA2 : averageGPA2 - averageGPA1;
    });
    cardsDispatch({type: "SET_CARDS", payload: newCards});
}

function handleSortByRating(cards, cardsDispatch, cardToProfessorInfo, ascending, e){
    if(cards === null){
        return;
    }
    if(cardToProfessorInfo === null){
        return;
    }
    const newCards = cards.sort((card1, card2) => {
        const professorId1 = card1.split("_")[1];
        const professorId2 = card2.split("_")[1];
        if(professorId1 === "info" | professorId2 === "info") return -1;
        const averageRating1 = cardToProfessorInfo.get(card1).averageRating;
        const averageRating2 = cardToProfessorInfo.get(card2).averageRating;

        return ascending ? averageRating1 - averageRating2 : averageRating2 - averageRating1;
    });
    cardsDispatch({type: "SET_CARDS", payload: newCards});
}

//ELIMINATE COURSES AND PROFESSORS CONTEXT
//professorcontext - needs a way to map card's professor id -> professorname
//coursescontext 
//  - card {courseNumber + professorId} -> averageGPA + averageRating
function ActionsHeader({ cardToProfessorInfo }){
    const { cards, dispatch } = useCardsContext();
    const [nameAscending, setNameAscending] = useState(true);
    const [gradeAscending, setGradeAscending] = useState(true);
    const [ratingAscending, setRatingAscending] = useState(true);

    return (
        <div className = "bg-black text-white grid grid-cols-12 gap-4 font-medium p-4 flex items-center">
            <span className = "col-span-2 text-left items-center ">Actions</span>
            <button className = "col-span-6 text-left"
                onClick = {(e) => {
                    handleSortByName(cards, dispatch, cardToProfessorInfo, nameAscending, e);
                    setNameAscending(!nameAscending);
                }}> 
                <span>Name</span>
                <span> ARROW</span>
            </button>
            <button className = "col-span-1 text-left"
                onClick = {(e) => {
                    handleSortByGrade(cards, dispatch, cardToProfessorInfo, gradeAscending, e);
                    setGradeAscending(!gradeAscending);
                }}>
                <span>Grades</span>
                <span> ARROW</span>
            </button>
            <button className = "col-span-3 text-left"
                onClick = {(e) => {
                    handleSortByRating(cards, dispatch, cardToProfessorInfo, ratingAscending, e);
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