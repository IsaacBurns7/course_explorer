import { useState, useRef } from "react";

import { useCardsContext } from "../hooks/useCardsContext";
import { useProfessorsContext } from "../hooks/useProfessorsContext";

function handleSortByName(cards, cardsDispatch, professors, ascending, e){
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
function handleSortByGrades(e){
    
}
function handleSortByRatings(e){

}


function ActionsHeader(){
    const { cards, dispatch } = useCardsContext();
    const { professors } = useProfessorsContext();
    const [ascending, setAscending] = useState(true);

    return (
        <div className = "bg-black text-white grid grid-cols-12 gap-4 font-medium p-4 flex items-center">
            <span className = "col-span-2 text-left items-center ">Actions</span>
            <button className = "col-span-6 text-left"
                onClick = {(e) => {
                    handleSortByName(cards, dispatch, professors, ascending, e);
                    setAscending(!ascending);
                }}> 
                <span>Name</span>
                <span> ARROW</span>
            </button>
            <button className = "col-span-1 text-left">
                <span>Grades</span>
                <span> ARROW</span>
            </button>
            <button className = "col-span-3 text-left">
                <span>Rating</span>
                <span> ARROW</span>
            </button>
        </div>
    )
}

export default ActionsHeader;