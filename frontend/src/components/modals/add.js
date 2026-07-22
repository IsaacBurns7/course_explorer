"use client"

import { useState, useEffect, useRef } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { getAllCourses } from "../../hooks/useAllCourses";
import axios from "axios"

export default function AddClassModal({ isOpen, onClose, onAdd, onAddSemester, onAddTransfer, semesters, showAlert, currentSemester }) {
  const [courses, setCourses] = useState(new Set());
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [selectedSemester, setSelectedSemester] = useState("")
  const [searchTerm, setSearchTerm] = useState("");
  // 'class' | 'semester' | 'credit'. Restored from the last-used mode so the modal
  // reopens on whatever the user did last (requirement).
  const [mode, setMode] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("addModalMode") || "class"
    return "class"
  })
  const [newSemesterTerm, setNewSemesterTerm] = useState("Spring")
  const [newSemesterYear, setNewSemesterYear] = useState(new Date().getFullYear())

  // --- Credit transfer flow state ---
  const [creditMethods, setCreditMethods] = useState([])   // [{id, name}]
  const [creditMethod, setCreditMethod] = useState("")     // selected method id
  const [creditExams, setCreditExams] = useState([])       // exam name list for the method
  const [creditExam, setCreditExam] = useState("")
  const [creditScore, setCreditScore] = useState("")
  const [creditResult, setCreditResult] = useState(null)   // evaluate response
  const [creditClaims, setCreditClaims] = useState([])     // course codes the user will claim
  const [creditBusy, setCreditBusy] = useState(false)

  const courseCacheRef = useRef(new Map());
  const courseListRef = useRef(null);
  const semesterRefs = useRef({});

  // Persist the mode so the modal reopens where the user left off.
  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("addModalMode", mode)
  }, [mode])

  // Load the credit methods lazily — only when the Credit Transfer tab is first opened.
  useEffect(() => {
    if (mode === "credit" && creditMethods.length === 0) {
      axios.get("/server/api/credits/methods")
        .then((r) => setCreditMethods(r.data))
        .catch((err) => console.error("Failed to load credit methods", err))
    }
  }, [mode, creditMethods.length])

  useEffect(() => {
    if (isOpen && currentSemester) {
      setSelectedSemester(currentSemester)
    }
  }, [isOpen, currentSemester])

  useEffect(() => {
    if (courseListRef.current) {
      courseListRef.current.scrollTop = 0;
    }
  }, [searchTerm]);

  useEffect(() => {
    getAllCourses()
      .then(courseSet => {
        setCourses(prev => {
          const newSet = prev;
          courseSet.forEach((courseKey) => {
            newSet.add(courseKey);
          })
          return newSet;
        });
      })
      .catch(err => console.error("Failed to load courses", err));
  }, []);

  useEffect(() => {
    if (isOpen && currentSemester) {
      setSelectedSemester(currentSemester);

      setTimeout(() => {
        const ref = semesterRefs.current[currentSemester];
        if (ref) {
          ref.scrollIntoView({ behavior: "instant", block: "nearest" });
        }
      }, 0);
    }
  }, [isOpen, currentSemester]);

  if (!isOpen) return null

  const filteredCourses = Array.from(courses).filter(
    (course) =>
      course.toLowerCase().includes(searchTerm.toLowerCase()),
  ).slice(0, 50);

  const currentYear = new Date().getFullYear()
  const availableYears = Array.from({ length: 11 }, (_, i) => currentYear + i)

  const handleAddClass = () => {
    if (!selectedCourse) {
      showAlert("Please select a course to add.", "warning")
      return
    }

    if (!selectedSemester) {
      showAlert("Please select a semester to add the course to.", "warning")
      return
    }

    // A course may be repeated across semesters (e.g. retakes), so only block a duplicate
    // within the SAME semester it's being added to.
    const targetSemester = Array.isArray(semesters)
      ? semesters.find((semester) => semester.name === selectedSemester)
      : null;
    const courseAlreadyInSemester =
      targetSemester &&
      Array.isArray(targetSemester.courses) &&
      targetSemester.courses.some(
        (course) =>
          course.department === selectedCourse.department &&
          course.number === selectedCourse.number
      );

    if (courseAlreadyInSemester) {
      showAlert(
        `${selectedCourse.department} ${selectedCourse.number} is already in ${selectedSemester}.`,
        "error"
      );
      return;
    }
    onAdd(selectedCourse, selectedSemester)
    showAlert(
      `Successfully added ${selectedCourse.department} ${selectedCourse.number} to ${selectedSemester}!`,
      "success",
    )

    // Keep the semester selected so multiple classes can be added to it in a row.
    setSelectedCourse(null)
    setSearchTerm("")
  }

  const handleAddSemester = () => {
    const newSemesterName = `${newSemesterTerm} ${newSemesterYear}`

    const semesterExists = semesters.some((semester) => semester.name === newSemesterName)

    if (semesterExists) {
      showAlert(`${newSemesterName} already exists in your planner.`, "error")
      return
    }

    onAddSemester(newSemesterName)
    showAlert(`Successfully added ${newSemesterName} to your planner!`, "success")
  }

  const handleClose = () => {
    setSelectedCourse(null)
    setSelectedSemester("")
    setSearchTerm("")
    // Keep `mode` so the modal reopens on the last-used tab.
    setNewSemesterTerm("Spring")
    setNewSemesterYear(currentYear)
    onClose()
  }

  // --- Credit transfer handlers ---

  const handleSelectMethod = async (id) => {
    setCreditMethod(id)
    setCreditExam("")
    setCreditScore("")
    setCreditResult(null)
    setCreditClaims([])
    setCreditExams([])
    try {
      const response = await axios.get(`/server/api/credits/${id}/exams`)
      setCreditExams(response.data)
    } catch (error) {
      console.error("Failed to load exams", error)
      showAlert("Failed to load exams for that method.", "error")
    }
  }

  const handleEvaluateCredit = async () => {
    if (!creditExam || creditScore === "") {
      showAlert("Select an exam and enter your score.", "warning")
      return
    }
    setCreditBusy(true)
    try {
      const response = await axios.post(`/server/api/credits/${creditMethod}/evaluate`, {
        exam: creditExam,
        score: Number(creditScore),
      })
      setCreditResult(response.data)
      // Pre-check the awarded courses (all of them when both are granted; none for an
      // "or" choice, where the student must pick one).
      const awarded = response.data.awarded
      setCreditClaims(
        awarded && awarded.relation !== "or" ? awarded.courses.map((c) => c.code) : []
      )
    } catch (error) {
      console.error("Failed to evaluate credit", error)
      showAlert("Failed to check credit. Please try again.", "error")
    } finally {
      setCreditBusy(false)
    }
  }

  const toggleClaim = (code, singleChoice) => {
    setCreditClaims((prev) => {
      if (singleChoice) return prev.includes(code) ? [] : [code]
      return prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    })
  }

  const handleClaimCredit = () => {
    if (creditClaims.length === 0) {
      showAlert("Select at least one course to claim.", "warning")
      return
    }
    // The evaluate response already carries each course's real hours + title, so just
    // pass the selected ones straight through.
    const claimed = (creditResult?.awarded?.courses || [])
      .filter((c) => creditClaims.includes(c.code))
      .map((c) => ({
        department: c.department,
        number: c.number,
        hours: Number(c.hours) || 0,
        title: c.title || c.code,
        professors: [],
      }))
    const methodName = creditMethods.find((m) => m.id === creditMethod)?.name || creditMethod
    onAddTransfer(claimed, {
      method: creditMethod,
      methodName,
      exam: creditExam,
      score: Number(creditScore),
    })
    showAlert(
      `Added ${claimed.length} transfer credit${claimed.length === 1 ? "" : "s"} from ${creditExam}.`,
      "success"
    )
    // Reset for the next entry but stay on the credit tab.
    setCreditExam("")
    setCreditScore("")
    setCreditResult(null)
    setCreditClaims([])
  }

  const handleCourseSelect = async (courseString) => {
    try {
      const cache = courseCacheRef.current;
      if (cache.has(courseString)) {
        setSelectedCourse(cache.get(courseString));
      } else {
        const response = await axios.post("/server/api/planner2/class", { class: courseString });
        setSelectedCourse(response.data);
        cache.set(courseString, response.data);
      }
    } catch (error) {
      console.error("Failed to fetch course info:", error);
      showAlert("Failed to load course information. Please try again.", "error");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-dark-card bg-opacity-50 flex items-start justify-center z-40 p-4 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          style={{ WebkitOverflowScrolling: "touch" }} // smooth scrolling on iOS
        >
          <motion.div
            className="bg-dark-card border border-dark-border rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto flex flex-col shadow-lg"
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            style={{ marginTop: "2rem" }}
          >
            {/* HEADER + MODE TOGGLE (sticky) */}
            <div
              className="flex flex-col bg-dark-card"
              style={{
                position: "sticky",
                top: 0,
                zIndex: 20,
                paddingBottom: "1.5rem",
                backgroundColor: "rgb(20 20 20)", // match dark-card bg
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-100">Add to Planner</h3>
                <button onClick={handleClose} className="text-gray-400 hover:text-gray-200 transition">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex mb-6 bg-dark-input rounded-lg p-1">
                <button
                  onClick={() => setMode("class")}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition ${
                    mode === "class" ? "bg-dark-select text-white" : "text-gray-300 hover:text-gray-100"
                  }`}
                >
                  Add Class
                </button>
                <button
                  onClick={() => setMode("semester")}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition ${
                    mode === "semester" ? "bg-dark-select text-white" : "text-gray-300 hover:text-gray-100"
                  }`}
                >
                  Add Semester
                </button>
                <button
                  onClick={() => setMode("credit")}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition ${
                    mode === "credit" ? "bg-dark-select text-white" : "text-gray-300 hover:text-gray-100"
                  }`}
                >
                  Credit Transfer
                </button>
              </div>
            </div>

            {/* TAB CONTENT */}
            <div className="flex-grow overflow-y-hidden">
              <AnimatePresence mode="wait" initial={false}>
                {mode === "class" && (
                  <motion.div
                    key="class-tab"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    {/* Search */}
                    <div className="mb-4">
                      <input
                        type="text"
                        placeholder="Search courses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 border border-dark-border rounded-md text-sm focus:ring-2 focus:ring-dark-select focus:border-dark-select bg-dark-input text-gray-200"
                      />
                    </div>

                    {/* Course Selection */}
                    <div className="mb-4">
                      <h4 className="text-md font-medium text-gray-200 mb-2">Select Course:</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto border border-dark-border rounded p-2" ref={courseListRef}>
                        {filteredCourses.map((course, index) => (
                          <button
                            key={index}
                            onClick={() => handleCourseSelect(course)}
                            className={`w-full text-left p-2 rounded transition ${
                              `${selectedCourse?.department} ${selectedCourse?.number}` === course
                                ? "bg-dark-select text-white border border-dark-border"
                                : "bg-dark-input border border-dark-border hover:bg-dark-hover text-gray-200"
                            }`}
                          >
                            <div className="font-medium">
                              {course}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Semester Selection */}
                    <div className="mb-6">
                      <h4 className="text-md font-medium text-gray-200 mb-2">Select Semester:</h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {semesters.map((semester) => (
                          <button
                            key={semester.name}
                            ref={(el) => (semesterRefs.current[semester.name] = el)}
                            onClick={() => setSelectedSemester(semester.name)}
                            className={`w-full text-left p-2 rounded transition ${
                              selectedSemester === semester.name
                                ? "bg-dark-select text-white"
                                : "bg-dark-input border border-dark-border hover:bg-dark-hover text-gray-200"
                            }`}
                          >
                            {semester.name}
                            <span className="text-sm text-gray-400 ml-2">({semester.courses.length} courses)</span>
                          </button>
                        ))}
                        <button
                          key="Add Semester"
                          onClick={() => setMode("semester")}
                          className={`p-2 rounded text-sm font-medium transition bg-dark-input border border-dark-border hover:bg-dark-hover text-gray-200`}
                        >
                          Add Semester
                        </button>
                      </div>
                    </div>

                    {/* Selected Course Preview */}
                    {selectedCourse && (
                      <div className="mb-4 p-3 bg-dark-input border border-dark-border rounded">
                        <h5 className="font-medium text-gray-200 mb-2">Selected Course:</h5>
                        <div className="text-sm text-gray-300">
                          <div>
                            <strong>
                              {selectedCourse.department} {selectedCourse.number}
                            </strong>{" "}
                            - {selectedCourse.title}
                          </div>
                          <div>{selectedCourse.hours} credit hours</div>
                          <div>Professors: {selectedCourse.professors.length}</div>
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-3 justify-end">
                      <button
                        onClick={handleAddClass}
                        disabled={!selectedCourse || !selectedSemester}
                        className="px-4 py-2 bg-dark-select text-white rounded hover:bg-dark-select transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add Class
                      </button>
                    </div>
                  </motion.div>
                )}

                {mode === "semester" && (
                  <motion.div
                    key="semester-tab"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    {/* Semester Creation */}
                    <div className="space-y-4 mb-6">
                      <div>
                        <h4 className="text-md font-medium text-gray-200 mb-2">Select Term:</h4>
                        <div className="grid grid-cols-3 gap-2">
                          {["Spring", "Summer", "Fall"].map((term) => (
                            <button
                              key={term}
                              onClick={() => setNewSemesterTerm(term)}
                              className={`p-2 rounded text-sm font-medium transition ${
                                newSemesterTerm === term
                                  ? "bg-dark-select text-white"
                                  : "bg-dark-input border border-dark-border hover:bg-dark-hover text-gray-200"
                              }`}
                            >
                              {term}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-md font-medium text-gray-200 mb-2">Select Year:</h4>
                        <select
                          value={newSemesterYear}
                          onChange={(e) => setNewSemesterYear(Number.parseInt(e.target.value))}
                          className="w-full p-2 border border-dark-border rounded-md text-sm focus:ring-2 focus:ring-dark-select focus:border-dark-select bg-dark-input text-gray-200"
                        >
                          {availableYears.map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="p-3 bg-dark-input border border-dark-border rounded">
                        <h5 className="font-medium text-gray-200 mb-1">New Semester:</h5>
                        <div className="text-lg text-emerald-400 font-medium">
                          {newSemesterTerm} {newSemesterYear}
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-3 justify-end">
                      <button
                        onClick={handleAddSemester}
                        className="px-4 py-2 bg-dark-select text-white rounded hover:bg-dark-select transition"
                      >
                        Add Semester
                      </button>
                    </div>
                  </motion.div>
                )}

                {mode === "credit" && (
                  <motion.div
                    key="credit-tab"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    {/* Step 1: pick how the credit was earned */}
                    <div>
                      <h4 className="text-md font-medium text-gray-200 mb-2">How did you earn the credit?</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {creditMethods.map((method) => (
                          <button
                            key={method.id}
                            onClick={() => handleSelectMethod(method.id)}
                            className={`p-2 rounded text-sm font-medium transition text-left ${
                              creditMethod === method.id
                                ? "bg-dark-select text-white"
                                : "bg-dark-input border border-dark-border hover:bg-dark-hover text-gray-200"
                            }`}
                          >
                            {method.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Step 2: pick the exam and enter the score */}
                    {creditMethod && (
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-md font-medium text-gray-200 mb-2">Exam</h4>
                          <select
                            value={creditExam}
                            onChange={(e) => {
                              setCreditExam(e.target.value)
                              setCreditResult(null)
                            }}
                            className="w-full p-2 border border-dark-border rounded-md text-sm bg-dark-input text-gray-200"
                          >
                            <option value="">— Select an exam —</option>
                            {creditExams.map((exam) => (
                              <option key={exam} value={exam}>{exam}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <h4 className="text-md font-medium text-gray-200 mb-2">Your score</h4>
                          <input
                            type="number"
                            value={creditScore}
                            onChange={(e) => {
                              setCreditScore(e.target.value)
                              setCreditResult(null)
                            }}
                            placeholder="e.g. 4"
                            className="w-full p-2 border border-dark-border rounded-md text-sm bg-dark-input text-gray-200"
                          />
                        </div>
                        <button
                          onClick={handleEvaluateCredit}
                          disabled={!creditExam || creditScore === "" || creditBusy}
                          className="px-4 py-2 bg-dark-select text-white rounded hover:bg-dark-select transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {creditBusy ? "Checking…" : "Check Credit"}
                        </button>
                      </div>
                    )}

                    {/* Step 3: show the award and let the user claim course(s) */}
                    {creditResult && !creditResult.eligible && (
                      <div className="p-3 bg-dark-input border border-dark-border rounded text-sm text-amber-300">
                        A score of {creditScore} does not qualify for credit
                        {creditResult.minScore != null && ` — a minimum score of ${creditResult.minScore} is required`}.
                      </div>
                    )}

                    {creditResult && creditResult.eligible && creditResult.awarded.advisor && (
                      <div className="p-3 bg-dark-input border border-dark-border rounded text-sm text-gray-300">
                        This exam grants credit only through your academic advisor
                        {creditResult.awarded.hours ? ` (up to ${creditResult.awarded.hours} hours)` : ""}.
                        {creditResult.awarded.note && (
                          <div className="text-xs text-gray-500 mt-1">{creditResult.awarded.note}</div>
                        )}
                      </div>
                    )}

                    {creditResult && creditResult.eligible && !creditResult.awarded.advisor && (
                      <div className="p-3 bg-dark-input border border-dark-border rounded">
                        <h5 className="font-medium text-gray-200 mb-1">
                          Credit available ({creditResult.awarded.hours} hours)
                        </h5>
                        <p className="text-xs text-gray-500 mb-3">
                          {creditResult.awarded.relation === "or"
                            ? "Choose one course to claim:"
                            : "Select the course(s) to add:"}
                        </p>
                        <div className="space-y-2">
                          {creditResult.awarded.courses.map((course) => {
                            const singleChoice = creditResult.awarded.relation === "or"
                            const checked = creditClaims.includes(course.code)
                            return (
                              <label
                                key={course.code}
                                className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition ${
                                  checked
                                    ? "bg-dark-select border-dark-border text-white"
                                    : "bg-dark-input border-dark-border hover:bg-dark-hover text-gray-200"
                                }`}
                              >
                                <input
                                  type={singleChoice ? "radio" : "checkbox"}
                                  name="credit-claim"
                                  checked={checked}
                                  onChange={() => toggleClaim(course.code, singleChoice)}
                                />
                                <span className="text-sm font-medium">{course.code}</span>
                              </label>
                            )
                          })}
                        </div>
                        <div className="flex justify-end mt-4">
                          <button
                            onClick={handleClaimCredit}
                            disabled={creditClaims.length === 0 || creditBusy}
                            className="px-4 py-2 bg-dark-select text-white rounded hover:bg-dark-select transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {creditBusy ? "Adding…" : "Claim Credit"}
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}