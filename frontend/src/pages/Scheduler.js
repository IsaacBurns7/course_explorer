"use client"

import { useState } from "react"
import ClassSelector from "../components/scheduler/class-selector"
import Scheduler from "../components/scheduler/scheduler"
import ScheduleFinder from "../components/ScheduleFinder"

export default function Home() {
  const savedPlanner = localStorage.getItem("academicPlanner");

  if (!savedPlanner || savedPlanner == "{}") return <div className="fixed inset-0 flex flex-col items-center justify-center bg-background">
      {/* Text */}
      <h2 className="text-xl font-semibold mb-2 text-white">{`No courses have been inputted for Spring 2026`}</h2>
      <a href = "/planner"><p className="text-blue-light hover:text-blue-dark hover:underline">Make sure you filled out your courses for Spring 2026 in the planner!</p></a>
      <br />
      <p className="text-gray-light text=xs">A way to input courses here will be coming soon!</p>
    </div>
  return <div className="pt-32 px-40">
          <ScheduleFinder planner={savedPlanner} />
        </div>
}
