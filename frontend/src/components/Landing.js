import React from "react";
import '../styles/tailwind.css'
import '../styles/wave.css'; // Make sure this line is present
import '../styles/navbar.css'
import AutoCompleteSearch from './Search';
const Landing = () => {
  return (
<section className="wave-section bg-black">

  <div className="wave">
    <span></span>
    <span></span>
    <span></span>
  </div>

  <div className="relative z-10 text-center">
    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2">Course Explorer</h1>
    <h5 className="text-xl bg-gradient-to-r from-yellow-500 to-yellow-300 text-transparent bg-clip-text mb-6">
      Lorem ipsum dolor sit amet
    </h5>
    <div>
  <AutoCompleteSearch />
</div>
  </div>
</section>
  );
};

export default Landing;