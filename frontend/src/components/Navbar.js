import { Link } from "react-router-dom";

import SearchButton from "./SearchButton";

const Navbar = () => { 

    return (
        <div className = "flex p-4 gap-6">
            <Link to = "/">
                <h1>Home</h1>
            </Link>

            <SearchButton />

            <Link to = "/planner">
                {"<planner>"}
            </Link>
        </div>
    )
}

export default Navbar;