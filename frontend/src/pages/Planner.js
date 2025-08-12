"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PlannerDisplay from "../components/Planner";
import UploadPlannerModal from "../components/modals/upload";

export default function Planner() {
  const [currentView, setCurrentView] = useState("landing");
  const [planner, setPlanner] = useState({});
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPlanner = localStorage.getItem("academicPlanner");
      if (savedPlanner && savedPlanner !== "{}") {
        const parsedPlanner = JSON.parse(savedPlanner);
        setPlanner(parsedPlanner);
        setCurrentView("planner");
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading && typeof window !== "undefined") {
      localStorage.setItem("academicPlanner", JSON.stringify(planner));
    }
  }, [planner, loading]);

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center" />;
  }

  const updatePlanner = (newPlanner) => {
    setPlanner(newPlanner);
  };

  const handleStartFromScratch = () => {
    setPlanner({});
    setCurrentView("planner");
  };

  const handlePlannerUploaded = (plannerData) => {
    setPlanner(plannerData);
    setCurrentView("planner");
  };

  const handleBackToLanding = () => {
    setPlanner({});
    setCurrentView("landing");
  };

  const fadeVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div className="min-h-screen bg-background pt-16">
      <AnimatePresence mode="wait">
        {currentView === "planner" ? (
          <motion.div
            key="planner"
            variants={fadeVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4 }}
            className="p-4"
          >
            <PlannerDisplay
              planner={planner}
              onUpdatePlanner={updatePlanner}
              handleBackToLanding={handleBackToLanding}
            />
          </motion.div>
        ) : (
          <motion.div
            key="landing"
            variants={fadeVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4 }}
            className="flex items-center justify-center p-4"
          >
            <motion.div
              className="max-w-4xl w-full"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="text-center mb-12">
                <motion.h1
                  className="text-5xl font-bold text-white mb-16 pt-16"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  Academic Planner
                </motion.h1>
                <motion.p
                  className="text-xl text-gray-300 max-w-2xl mx-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  Please select an option to start your planner
                </motion.p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                {[{
                  color: "emerald",
                  title: "Start from Scratch",
                  desc: "Create a brand new academic plan. Perfect for new students or those wanting to completely redesign their course schedule.",
                  icon: (
                    <>
                      <path d="M12 5v14" />
                      <path d="M5 12h14" />
                    </>
                  ),
                  onClick: handleStartFromScratch
                },
                {
                  color: "blue",
                  title: "Upload Existing Planner",
                  desc: "Already have an academic plan? Upload your existing planner from a PDF document or paste the text directly.",
                  icon: (
                    <>
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7,10 12,15 17,10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </>
                  ),
                  onClick: () => setShowUploadModal(true)
                }].map((card, i) => (
                  <motion.div
                    key={card.title}
                    className={`bg-dark-card border border-gray-700 rounded-xl p-8 hover:border-${card.color}-500 transition-all duration-300 hover:shadow-lg hover:shadow-${card.color}-500/20`}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.2, duration: 0.5 }}
                  >
                    <div className="text-center">
                      <div className={`w-16 h-16 bg-${card.color}-600 rounded-full flex items-center justify-center mx-auto mb-6`}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-white w-8 h-8"
                        >
                          {card.icon}
                        </svg>
                      </div>
                      <h2 className="text-2xl font-semibold text-white mb-4">{card.title}</h2>
                      <p className="text-gray-400 mb-6">{card.desc}</p>
                      <button
                        onClick={card.onClick}
                        className={`w-full px-6 py-3 bg-${card.color}-600 text-white rounded-lg hover:bg-${card.color}-500 transition-colors font-medium`}
                      >
                        {card.title.includes("Upload") ? "Upload Planner" : "Create New Planner"}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <UploadPlannerModal
              isOpen={showUploadModal}
              onClose={() => setShowUploadModal(false)}
              onPlannerUploaded={handlePlannerUploaded}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}