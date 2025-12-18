"use client";

import { motion } from "framer-motion";
import AutoCompleteSearch from "../components/Search.js";
import TextType from "../components/TextType.js";
import HomeIcon from "../components/ui/home.js";
import FloatingCourses from "../components/ui/FloatingCourses.js";
import FloatingProfessors from "../components/ui/FloatingProfessors.js";
import FloatingPlanner from "../components/ui/FloatingPlanner.js";
import { getAllCourses } from "../hooks/useAllCourses.js";
import { getAllProfs } from "../hooks/useAllProfs.js";
import { useEffect, useState } from "react";

const professors = [
  "Dr. Smith",
  "Prof. Johnson",
  "Dr. Williams",
  "Prof. Brown",
  "Dr. Davis",
  "Prof. Miller",
  "Dr. Wilson",
  "Prof. Moore",
];

const colors = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#98D8C8",
  "#F7DC6F",
];

const professorColors = [
  "#FFB3BA",
  "#BAFFC9",
  "#BAE1FF",
  "#FFFFBA",
  "#FFD1DC",
  "#E0BBE4",
  "#C7CEEA",
  "#FFDAB9",
];

const courseCodes = ["CSCE101", "MATH241", "PHYS212", "BIOL112", "STAT302"];

const Landing = () => {
  const [courseCount, setCourseCount] = useState(500);
  const [profCount, setProfCount] = useState(500);

  useEffect(() => {
    getAllCourses().then((courses) => setCourseCount(courses.size));
    getAllProfs().then((profs) => setProfCount(profs.size));
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <motion.section
        className="relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-32">
          {/* Logo */}
          <motion.div
            className="flex justify-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="scale-75 md:scale-100 pl-10 md:pl-24">
              <HomeIcon />
            </div>
          </motion.div>

          {/* Main Heading */}
          <motion.div
            className="text-center max-w-4xl mx-auto mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
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
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mt-16">
              Explore courses, discover professors, and plan your academic
              journey at Texas A&M
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            className="flex justify-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <AutoCompleteSearch navbarMode={false} />
          </motion.div>

          {/* Tagline */}
          <motion.p
            className="text-center text-muted-foreground text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            Made with ❤️ by Aggies for Aggies
          </motion.p>
        </div>
      </motion.section>

      <motion.div
  className="flex justify-center -mt-20"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 1, duration: 0.8 }}
>
        <button
  onClick={() =>
    document.getElementById("features-section")?.scrollIntoView({ behavior: "smooth" })
  }
  className="flex flex-col items-center text-muted-foreground hover:text-yellow-400 transition-colors relative"
>
  <span className="text-sm mb-1">Learn more</span>
  <motion.div
    animate={{ y: [0, 10, 0] }}
    transition={{ repeat: Infinity, duration: 1.5 }}
    className="pointer-events-none"
  >
    ↓
  </motion.div>
</button>
    </motion.div>

      {/* Features Section (3 boxes instead of carousel) */}
      <motion.section
        className="py-20 bg-muted/30"
        id = "features-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-lg text-muted-foreground">
              Explore tools designed for every part of your academic journey
            </p>
          </motion.div>

          {/* 3 Feature Boxes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Box 1: Courses */}
            <motion.div
              className="relative p-8 bg-background rounded-2xl shadow-lg flex flex-col items-center justify-center text-center hover:shadow-xl transition"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.6 }}
            >
              <FloatingCourses courseCodes={courseCodes} colors={colors} />
              <h3 className="text-2xl font-semibold mt-64">
                {courseCount}+ Courses
              </h3>
              <p className="text-muted-foreground mt-2">
                Discover every course at Texas A&M and plan your schedule
                smarter.
              </p>
            </motion.div>

            {/* Box 2: Professors */}
            <motion.div
              className="relative p-8 bg-background rounded-2xl shadow-lg flex flex-col items-center justify-center text-center hover:shadow-xl transition"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.6 }}
            >
              <FloatingProfessors
                professors={professors}
                colors={professorColors}
              />
              <h3 className="text-2xl font-semibold mt-64">
                {profCount}+ Professors
              </h3>
              <p className="text-muted-foreground mt-2">
                Learn from the experiences of students and explore faculty
                insights.
              </p>
            </motion.div>

            {/* Box 3: Planner */}
            <motion.div
              className="relative p-8 bg-background rounded-2xl shadow-lg flex flex-col items-center justify-center text-center hover:shadow-xl transition"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.7, duration: 0.6 }}
            >
              <FloatingPlanner colors={professorColors} />
              <h3 className="text-2xl font-semibold mt-64">Degree Planner</h3>
              <p className="text-muted-foreground mt-2">
                Plan your academic journey semester by semester and stay on
                track.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default Landing;
