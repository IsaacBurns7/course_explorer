import { createContext, useReducer, useMemo } from "react"; 

export const SearchContext = createContext();

export const SearchActions = {
    SET_SEARCH_OPTIONS: "SET_SEARCH_OPTIONS"
}
// const defaultSearchOptions = {
    //     minGPA: 3.00,
    //     minRating: 3.00,
    //     teachingNextSemester: false,
    //     semesters: [
    //         "FALL 2024",
    //         "SPRING 2025",
    //         "SUMMER 2025"
    //     ]
    // }

export const SearchReducer = (state, action) => {
    switch(action.type){
        case SearchActions.SET_SEARCH_OPTIONS:
            return {
                search_options: action.payload
            }
        default: 
            return state
    }
}

export const SearchContextProvider = ( {children} ) => {
    const [state, dispatch] = useReducer(SearchReducer, {
        search_options: null    
    });

    const contextValue = useMemo(() => {
        return {
            ...state,
            dispatch
        }
    })

    return <SearchContext.Provider value = {contextValue}>
        {children}
    </SearchContext.Provider>
}