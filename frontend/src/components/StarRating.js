const StarRating = ({rating, maxStars = 5, starSize = 6, activeColor = "text-yellow-400", inactiveColor = "text-gray-300"}) => {
    const ratingArray = new Array(maxStars).fill(0);
    const starWidth = starSize;
    const starHeight = starSize; //*0.95
    const viewBox = `0 0 ${starWidth*4} ${starHeight*4}`
    
    return ( 
        <div className = "flex items-center">
            {ratingArray.map((_, index) => {
                const ratingSlice = Math.min(rating, 1);
                rating -= ratingSlice;
                const fillPercentage = ratingSlice * 100;

                return ( 
                    <div 
                        key = {index}
                        className = {`relative w-${starSize} h-${starSize}`}    
                    >
                        <svg
                            viewBox = {viewBox}
                            className = {`absolute w-full h-full ${inactiveColor}`}
                        >
                            <path
                                d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"
                                fill="currentColor"
                            />
                        </svg>    
                        <div 
                            className = {`absolute overflow-hidden top-0 left-0 h-full`}
                            style = {{width: `${fillPercentage}%`}}
                        >
                            <svg
                                viewBox = {viewBox}
                                className = {`w-full h-full ${activeColor}`}    
                            >
                                <path 
                                    fill = "currentColor"
                                    d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                                />
                            </svg>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}


export default StarRating;
