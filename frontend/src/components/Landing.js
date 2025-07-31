import React from "react";
import '../styles/tailwind.css';
import '../styles/wave.css';
import '../styles/navbar.css';
import AutoCompleteSearch from './Search';

const Landing = () => {
  return (
    <section className="wave-section bg-black">
      <div className="wave">
        <span></span>
        <span></span>
        <span></span>
      </div>

      <div className="relative z-10 text-center px-4">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-3 drop-shadow-lg">
          Aggie Course Explorer
        </h1>
        <p className="text-lg md:text-xl bg-gradient-to-r from-yellow-400 to-yellow-200 text-transparent bg-clip-text mb-6">
          Your Gateway to Texas A&M Courses
        </p>

          <AutoCompleteSearch />
        

        <p className="mt-10 text-sm text-gray-300">
          Powered by Aggie Spirit &bull; Built for Students, by Students
        </p>
      </div>
    </section>
  );
};

export default Landing;