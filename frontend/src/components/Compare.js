import { useState } from "react";


const Compare = (comparedCards) => {
    const [cardsToColor, setCardsToColor] = useState({
        //exampleCard: exampleColor
    });
    return (
        <>
            <div className = "header">
                header options
            </div>
            <div className = "graph">
                this is gonna be a bar graph ~_~
            </div>
            <div className = "info">
                info on comparison
            </div>
        </>
    )
}

export default Compare;