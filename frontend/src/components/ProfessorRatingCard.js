function ProfessorRatingCard({props}){
    const {rating, totalRatings, wouldTakeAgain, GPA} = props;
    
    return (
        <div className = "bg-black text-white p-6 rounded-xl w-full max-w-2xl mx-auto shadow-lg">
            <div className = "grid grid-cols-2 md:grid-cols-4 gap-4 text-left mb-6">
                <div>
                    <p className = "text-2xl font-bold">{rating}</p>
                    <p className = "text-sm">Professor Rating</p>
                </div>
                <div>
                    <p className="text-2xl font-bold">{GPA}</p>
                    <p className="text-sm">GPA</p>
                </div>
                <div>
                    <p className="text-2xl font-bold">{totalRatings}</p>
                    <p className="text-sm">Ratings given</p>
                </div>
                <div>
                    <p className="text-2xl font-bold">{wouldTakeAgain}%</p>
                    <p className="text-sm">Would take again</p>
                </div>
            </div>
        </div>
    )
}

export default ProfessorRatingCard;
