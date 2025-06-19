import { useState, useRef } from "react";

function handleSortByName(e){
    //sorts professors context and commands app to rerender
    
}
function handleSortByGrades(e){
    
}
function handleSortByRatings(e){

}


function ActionsHeader(){
    return (
        <div className = "bg-black text-white grid grid-cols-12 gap-4 font-medium p-4 flex items-center">
            <span className = "col-span-2 text-left items-center ">Actions</span>
            <button className = "col-span-6 text-left"
                onClick = {(e) => {
                    handleSortByName(e);
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