//libraries
import { useEffect, useState } from "react";
import axios from "axios";

//components
import ProfessorCard from "../components/ProfessorCard";
import ActionsHeader from "../components/ActionsHeader";
import SearchOptions from "../components/SearchOptions";
import Compare from "../components/Compare";

//context
import { SearchContext } from "../context/search";
import { useSearchParams } from "react-router";

//hooks
// import { useSearchParams } from "react-router";
// import { useSearchContext } from "../hooks/useSearchContext";
// import { useCourseActions } from "../hooks/useCourseActions";
// import { useCoursesContext } from "../hooks/useCoursesContext";
// import { useCardsContext } from "../hooks/useCardsContext";
// import { useCompareContext } from "../hooks/useCompareContext";
// import { useProfessorsInfo } from "../hooks/useProfessorsInfo";
// import { useGraphData } from "../hooks/useGraphData";

const SearchResults = () => {
    const [searchParams, setSearchParams] = useSearchParams(); 
    const { comparedCards, courses, professors, professorFilters, graphData} = useContext(SearchContext);

    // const { series, categories, existingNames } = useGraphData(comparedCards, cardToProfessorInfo);

    const dept = searchParams.get("dept");
    const courseNumber = searchParams.get("courseNumber");
    
    const courseId = `${dept} ${courseNumber}`;

    //4 useEffects for graphData, courses, professors, and ?semesters
    useEffect(() => {
    
    });

    //create map (<COURSEID_PROFESSORID> -> { rating, gpa, name }
    useEffect(() => {
        if(cards === null) return;
        const updateCardToProfessorInfo = (prevMap) => {
            const map = new Map(prevMap);
            // console.log(cards, course
            for(const card of cards){
                if(map.has(card)) continue;
                const professorId = card.split("_")[1];
                if(professorId === "info") continue;
                const courseIdRaw = card.split("_")[0];
                const dept = courseIdRaw.slice(0,4);
                const courseNumber = courseIdRaw.slice(4);
                const courseId = dept + " " + courseNumber;
                const professorInfo = courses[courseId][professorId].info;
                const { averageRating, averageGPA, name} = professorInfo;
                const neededInfo = {
                    averageRating, averageGPA, name
                }
                map.set(card, neededInfo);
            }
            return map;    
        }
        setCardToProfessorInfo(prev => updateCardToProfessorInfo(prev));
    }, [courses]);

function linkifyCourseCodes(description) {
  const regex = /\b([A-Z]{2,4})\s(\d{3})\b/g;

  const parts = [];
  let lastIndex = 0;

  let match;
  while ((match = regex.exec(description)) !== null) {
    const [fullMatch, dept, courseNumber] = match;
    const matchStart = match.index;

    // Push the text before the match
    if (matchStart > lastIndex) {
      parts.push(description.slice(lastIndex, matchStart));
    }

    // Push the link
    parts.push(
      <a
        key={`${dept}-${courseNumber}-${matchStart}`}
        href={`/dashboard?dept=${dept}&courseNumber=${courseNumber}`}
        className="text-blue-600 hover:underline"
      >
        {fullMatch}
      </a>
    );

    lastIndex = match.index + fullMatch.length;
  }

  // Push any remaining text
  if (lastIndex < description.length) {
    parts.push(description.slice(lastIndex));
  }

  return parts;
}

    console.log(courses);
    const courseTitle = courseInfo?.title;
    const courseDescription = courseInfo?.description

    return (
        <div className = "search-results pt-20">
            <div className="ml-4 mb-6">
                <h2 className="text-2xl font-semibold">{dept} {courseNumber}: {courseTitle}</h2>
                <p className="text-gray-600 mt-1">{courseDescription ? linkifyCourseCodes(courseDescription) : "Loading..."}</p>
            </div>
            <SearchOptions />
            <div className = "body grid grid-cols-12">
                <div className = "cards col-span-6">

                    <ActionsHeader cardToProfessorInfo = {cardToProfessorInfo}/>
                    {cards && cards.map((card) => {
                        const dept = card.slice(0,4);
                        const number = card.slice(4,7);
                        const professorId = card.split("_")[1];
                        if(professorId === "info"){
                            return;
                        }
                        const professor = courses[`${dept} ${number}`][professorId];
                        //verify professor matches search results
                        if(search_options){
                            const { minGPA, minRating } = search_options;
                            if(minGPA && professor.info.averageGPA < minGPA){
                                return;
                            }
                            if(minRating && professor.info.averageRating < minRating){
                                return;
                            }
                        }
                        // console.log(courses[`${dept} ${number}`]);
                        return <ProfessorCard 
                            key = {`${professorId}-${dept}-${number}`}
                            professorId = {professorId}
                            professor = {professor}
                            dept = {dept}
                            number = {number}
                        />
                    })}
                </div>
                <div className = "compare col-span-6">
                    <Compare 
                        categories = {categories}
                        series = {series}
                        names = {existingNames}
                        professorsInfo = {comparedProfessorsInfo}
                    />
                </div>
            </div>
        </div>
    )
} 

export default SearchResults;