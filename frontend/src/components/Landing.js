"use client"
import { motion } from "framer-motion"
import AutoCompleteSearch from "./Search"
import ParticlesBackground from "./Background"
import Carousel from './Carousel'
import TextType from './TextType';
import '../styles/wave.css'
import HomeIcon from './ui/home.js';

const Landing = () => {
  return (
    <div className="overflow-y-hidden "> 
      <motion.section
        className="wave-section bg-black overflow-y-hidden" 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="wave">
          <span></span>
          <span></span>
          <span></span>
        </div>

        {/* 💡 Gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background/20 pointer-events-none z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-background/10 via-transparent to-background/10 pointer-events-none z-10"></div>

        {/* 📐 Two-column Layout */}
        <div className="flex flex-col md:flex-row w-full max-w-full z-20 h-full"> {/* Added h-full */}
          {/* Left: Main Content */}
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 relative"> {/* Removed pl-20, added relative */}
  <div className="-mb-4 pl-16"> {/* Added wrapper div with margin-bottom */}
    <HomeIcon />
  </div>

  <span className="text-xl md:text-2xl lg:text-3xl font-bold">
                <span className="bg-gradient-to-r from-yellow-400 to-yellow-200 text-transparent bg-clip-text drop-shadow-lg">
                  ACE your{" "}
                  <TextType
                    text={["classes.", "semester.", "future."]}
                    typingSpeed={75}
                    pauseDuration={1500}
                    showCursor={true}
                    cursorCharacter="|"
                  />
                </span>
              </span>
  <div className="relative right-1"> {/* Removed -left-7 */}
    <AutoCompleteSearch navbarMode={false}/>
  </div>

  <p className="text-sm text-gray-300 drop-shadow-md">
   Made with ❤️ by Aggies for Aggies
  </p>
</div>

          {/* Right: Floating Text Effects */}
          <div className="flex-1 flex items-center justify-center p-4">
            <Carousel autoplay loop pauseOnHover={true} baseWidth={550} />
          </div>
        </div>
      </motion.section>
    </div>
  )
}

export default Landing