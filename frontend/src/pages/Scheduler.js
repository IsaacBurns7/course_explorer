"use client"

import { useState } from "react"
import ClassSelector from "../components/scheduler/class-selector"
import Scheduler from "../components/scheduler/scheduler"

export default function Home() {
  const [selectedClasses, setSelectedClasses] = useState(null)

  const handleClassesSelected = (classes) => {
    setSelectedClasses(classes)
  }

  const handleBack = () => {
    setSelectedClasses(null)
  }

  if (!selectedClasses) {
    return <ClassSelector onClassesSelected={handleClassesSelected} />
  }

  return <Scheduler selectedClasses={selectedClasses} onBack={handleBack} />
}
