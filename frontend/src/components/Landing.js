"use client"
import AutoCompleteSearch from "./Search"
import ParticlesBackground from "./Background"
import Carousel from './Carousel'
import '../styles/wave.css'
const Landing = () => {
  return (
    <section className="wave-section bg-black">
      <div className="wave">
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* 💡 Gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background/20 pointer-events-none z-10"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-background/10 via-transparent to-background/10 pointer-events-none z-10"></div>

      {/* 📐 Two-column Layout */}
      <div className="flex flex-col md:flex-row w-full max-w-full z-20 pt-15">
        {/* Left: Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center text-center pl-20 space-y-6">
  <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-2xl">
    Aggie Course Explorer
  </h1>

  <p className="text-lg md:text-xl bg-gradient-to-r from-yellow-400 to-yellow-200 text-transparent bg-clip-text drop-shadow-lg">
    Your Gateway to Texas A&M Courses
  </p>
  <div className = "relative -left-7">
  <AutoCompleteSearch />
  </div>

  <p className="text-sm text-gray-300 drop-shadow-md">
    Powered by Aggie Spirit &bull; Built for Students, by Students
  </p>
</div>

        {/* Right: Floating Text Effects */}
        <div className="flex-1 flex items-center justify-center p-4">
          <Carousel autoplay loop pauseOnHover = {true} baseWidth={550} />
        </div>
      </div>
    </section>
  )
}

export default Landing
