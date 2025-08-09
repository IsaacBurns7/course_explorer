import { useState, useRef } from "react";


function Actions({arrowIconRef, department, courseNumber, professorId}){
    const compareSVGRef = useRef(null);
    const compareRef = useRef(null);
    const plannerSVGRef = useRef(null);
    const plannerRef = useRef(null);
    const [isCompareChecked, setIsCompareChecked] = useState(false);
    const [isPlannerChecked, setIsPlannerChecked] = useState(false);

    function handleAddToCompare(){
        if(!isCompareChecked){
            dispatch({type: "ADD_CARD", payload: `${department}${courseNumber}_${professorId}`});
        }else{
            dispatch({type: "DELETE_CARD", payload: `${department}${courseNumber}_${professorId}`});
        }
        setIsCompareChecked(!isCompareChecked);
    }
    function addToPlanner(){
        setIsPlannerChecked(!isPlannerChecked);
    }

    return (
        <div className = "col-span-2 items-center justify-left gap-4 flex bg-zinc-900">
            <div><i className = "fas fa-chevron-right text-white rounded" ref = {arrowIconRef}></i></div>
            <div className="relative inline-block p-3">
                <input 
                    type="checkbox" 
                    id="myCheckbox" 
                    className="absolute inset-0 w-full h-full appearance-none rounded bg-black border-grey-700"
                    onChange = {(e) => {
                        e.stopPropagation(); 
                        handleAddToCompare();
                    }}
                    ref = {compareRef}/>
                <svg 
                    className="absolute w-full h-full text-white top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    viewBox="0 0 24 24"
                    ref = {compareSVGRef}>
                    <path d="M5 3H19C20.1 3 21 3.9 21 5V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V5C3 3.9 3.9 3 5 3Z"/>
                    <path className = {isCompareChecked ? "" : "hidden"} d="M9 12L11 14L15 10" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>
            <div className="relative inline-block p-3">
                <input 
                    type="checkbox" 
                    className="absolute inset-0 w-full h-full appearance-none rounded bg-black"
                    onChange = {(e) => {
                        e.stopPropagation(); 
                        addToPlanner();
                    }}
                    ref = {plannerRef}/>
                <svg 
                    className="absolute w-full h-full text-white top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none" 
                    fill= {isPlannerChecked ? "green" : "none"} 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    viewBox="0 0 24 24"
                    ref = {plannerSVGRef}>
                    <path 
                        d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2z"></path>
                    <path 
                        d="M17 3v8l-4-2-4 2V3"></path>
                </svg>
            </div>
        </div>
    )
}

export default Actions;