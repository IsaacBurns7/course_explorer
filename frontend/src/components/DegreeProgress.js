"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { evaluateAll } from "../lib/degreeProgress"

/*
Degree progress panel.

On mount it pulls the program pick-lists and the core curriculum from the backend
(GET /api/programs). Selecting a major or minor fetches that program's requirements
(GET /api/programs/:id/requirements) and caches it. "Check Requirements" then runs the
pure matching engine in lib/degreeProgress.js against the current planner — no server
round-trip, so it always reflects the plan as it stands right now.

Elective slots are shown as informational self-check items rather than met/missing: the
catalog only names the category ("Technical elective"), and which courses qualify is
governed by the footnote and the student's advisor.
*/

const MAX_MINORS = 2

export default function DegreeProgress({ planner }) {
  const [catalog, setCatalog] = useState({ majors: [], minors: [], core: [] })
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  const [majorId, setMajorId] = useState("")
  const [minorIds, setMinorIds] = useState(["", ""])
  const [programCache, setProgramCache] = useState({})
  const [fetching, setFetching] = useState(false)

  const [result, setResult] = useState(null)
  const [panelIndex, setPanelIndex] = useState(0)

  // Pick-lists + core curriculum, once on mount.
  useEffect(() => {
    let cancelled = false
    axios
      .get("/server/api/programs")
      .then((response) => {
        if (cancelled) return
        setCatalog({
          majors: response.data.majors || [],
          minors: response.data.minors || [],
          core: response.data.core || [],
        })
      })
      .catch((error) => {
        if (!cancelled) setLoadError(error.message || "Failed to load programs")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Restore a previous selection so the panel survives a reload like the planner does.
  useEffect(() => {
    if (typeof window === "undefined") return
    const saved = window.localStorage.getItem("degreeSelection")
    if (!saved) return
    try {
      const parsed = JSON.parse(saved)
      if (parsed.majorId) setMajorId(parsed.majorId)
      if (Array.isArray(parsed.minorIds)) {
        setMinorIds([parsed.minorIds[0] || "", parsed.minorIds[1] || ""])
      }
    } catch {
      /* ignore malformed selection */
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem("degreeSelection", JSON.stringify({ majorId, minorIds }))
  }, [majorId, minorIds])

  // Fetch (and cache) a program's requirements the first time it is selected.
  const ensureProgram = async (programId) => {
    if (!programId || programCache[programId]) return
    setFetching(true)
    try {
      const response = await axios.get(`/server/api/programs/${programId}/requirements`)
      setProgramCache((prev) => ({ ...prev, [programId]: response.data }))
    } catch (error) {
      setLoadError(`Failed to load requirements: ${error.message}`)
    } finally {
      setFetching(false)
    }
  }

  const handleMajorChange = (value) => {
    setMajorId(value)
    setResult(null)
    ensureProgram(value)
  }

  const handleMinorChange = (index, value) => {
    setMinorIds((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
    setResult(null)
    ensureProgram(value)
  }

  const handleCheck = async () => {
    // Make sure every selected program's requirements are loaded before evaluating.
    // A restored selection (from localStorage on reload) sets the ids but never fetched
    // their requirements, so reading the cache directly could miss the major and show
    // only the core. Load whatever is missing here, then evaluate from a merged cache.
    const ids = [majorId, ...minorIds].filter(Boolean)
    setFetching(true)
    const loaded = {}
    try {
      await Promise.all(
        ids.map(async (id) => {
          if (programCache[id]) {
            loaded[id] = programCache[id]
            return
          }
          const response = await axios.get(`/server/api/programs/${id}/requirements`)
          loaded[id] = response.data
        })
      )
    } catch (error) {
      setLoadError(`Failed to load requirements: ${error.message}`)
    } finally {
      setFetching(false)
    }

    const cache = { ...programCache, ...loaded }
    setProgramCache(cache)

    const major = majorId ? cache[majorId] : null
    const minors = minorIds.filter(Boolean).map((id) => cache[id]).filter(Boolean)
    setResult(evaluateAll({ major, minors, core: catalog.core, planner }))
    setPanelIndex(0)
  }

  const canCheck = Boolean(majorId || minorIds.some(Boolean)) && !fetching

  if (loading) {
    return (
      <div className="bg-dark-card border border-gray-700 rounded-xl p-6">
        <div className="text-gray-400">Loading degree programs…</div>
      </div>
    )
  }

  return (
    <div className="bg-dark-card border border-gray-700 rounded-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-1">Degree Progress</h2>
      <p className="text-gray-400 mb-6">
        Select your degree plan and any minors, then check what your planner still needs.
      </p>

      {loadError && (
        <div className="mb-4 p-3 rounded-lg bg-red-900/30 border border-red-700 text-red-200 text-sm">
          {loadError}
        </div>
      )}

      {/* Selectors */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <label className="block">
          <span className="text-sm text-gray-300">Major</span>
          <select
            value={majorId}
            onChange={(e) => handleMajorChange(e.target.value)}
            className="mt-1 w-full bg-dark-semester border border-gray-700 rounded-lg p-2 text-gray-100"
          >
            <option value="">— Select a major —</option>
            {catalog.majors.map((program) => (
              <option key={program.program_id} value={program.program_id}>
                {program.desc_name}
              </option>
            ))}
          </select>
        </label>

        {Array.from({ length: MAX_MINORS }).map((_, index) => (
          <label className="block" key={index}>
            <span className="text-sm text-gray-300">Minor {index + 1} (optional)</span>
            <select
              value={minorIds[index]}
              onChange={(e) => handleMinorChange(index, e.target.value)}
              className="mt-1 w-full bg-dark-semester border border-gray-700 rounded-lg p-2 text-gray-100"
            >
              <option value="">— None —</option>
              {catalog.minors
                // Don't offer a minor already chosen in the other slot.
                .filter((p) => p.program_id === minorIds[index] || !minorIds.includes(p.program_id))
                .map((program) => (
                  <option key={program.program_id} value={program.program_id}>
                    {program.desc_name}
                  </option>
                ))}
            </select>
          </label>
        ))}
      </div>

      <button
        onClick={handleCheck}
        disabled={!canCheck}
        className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors font-medium disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {fetching ? "Loading requirements…" : "Check Requirements"}
      </button>

      {result && <ResultCarousel result={result} index={panelIndex} setIndex={setPanelIndex} />}
    </div>
  )
}

/*
Shows one requirement panel at a time — Major first, then each Minor, then the University
Core Curriculum — with arrows in the top-right to loop through them.
*/
function ResultCarousel({ result, index, setIndex }) {
  const panels = []
  if (result.major) {
    panels.push({ key: "major", label: "Major", node: <ProgramResult result={result.major} label="Major" /> })
  }
  result.minors.forEach((minor) => {
    panels.push({ key: minor.program_id, label: "Minor", node: <ProgramResult result={minor} label="Minor" /> })
  })
  panels.push({ key: "core", label: "University Core Curriculum", node: <CoreResult core={result.core} /> })

  if (panels.length === 0) return null
  const current = ((index % panels.length) + panels.length) % panels.length // wrap + clamp
  const go = (delta) => setIndex(current + delta)

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-gray-400">
          {current + 1} of {panels.length}: <span className="text-gray-200">{panels[current].label}</span>
        </div>
        {panels.length > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => go(-1)}
              aria-label="Previous requirement group"
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-dark-semester border border-gray-700 text-gray-200 hover:border-emerald-500 transition-colors"
            >
              ‹
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Next requirement group"
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-dark-semester border border-gray-700 text-gray-200 hover:border-emerald-500 transition-colors"
            >
              ›
            </button>
          </div>
        )}
      </div>

      {panels[current].node}

      {panels.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {panels.map((panel, i) => (
            <button
              key={panel.key}
              onClick={() => setIndex(i)}
              aria-label={`Go to ${panel.label}`}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === current ? "bg-emerald-500" : "bg-gray-600 hover:bg-gray-500"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/* One program's met/missing named requirements plus its elective self-check list. */
function ProgramResult({ result, label }) {
  const complete = result.missingCount === 0
  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      <div className="bg-dark-semester p-4">
        <div className="text-xs uppercase tracking-wide text-gray-400">{label}</div>
        <div className="text-lg font-semibold text-gray-100">{result.desc_name}</div>
        <div className={`text-sm mt-1 ${complete ? "text-emerald-400" : "text-amber-400"}`}>
          {result.metCount} of {result.namedTotal} required courses complete
          {!complete && ` — ${result.missingCount} still needed`}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {result.missing.length > 0 && (
          <div>
            <div className="text-sm font-medium text-gray-300 mb-2">Still needed</div>
            <div className="flex flex-wrap gap-2">
              {result.missing.map((requirement, i) => (
                <span
                  key={`${requirement.course}-${i}`}
                  className="px-2 py-1 rounded bg-red-900/30 border border-red-800 text-red-200 text-sm"
                  title={
                    requirement.alternatives.length
                      ? `or ${requirement.alternatives.join(", ")}`
                      : undefined
                  }
                >
                  {requirement.course}
                  {requirement.alternatives.length > 0 && (
                    <span className="text-red-300/70"> +{requirement.alternatives.length} alt</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

        {result.met.length > 0 && (
          <div>
            <div className="text-sm font-medium text-gray-300 mb-2">Completed</div>
            <div className="flex flex-wrap gap-2">
              {result.met.map((requirement, i) => (
                <span
                  key={`${requirement.course}-${i}`}
                  className="px-2 py-1 rounded bg-emerald-900/30 border border-emerald-800 text-emerald-200 text-sm"
                >
                  {requirement.satisfiedBy}
                </span>
              ))}
            </div>
          </div>
        )}

        {result.electiveSlots.length > 0 && (
          <div>
            <div className="text-sm font-medium text-gray-300 mb-1">
              Elective slots — verify these yourself
            </div>
            <p className="text-xs text-gray-500 mb-2">
              The catalog only names the category; which courses qualify depends on the note
              below and your advisor.
            </p>
            <ul className="space-y-1">
              {result.electiveSlots.map((slot, i) => (
                <li key={`${slot.course}-${i}`} className="text-sm text-gray-300">
                  <span className="text-gray-100">{slot.course}</span>
                  {slot.footnotes.map((n) =>
                    result.footnotes[n] ? (
                      <span key={n} className="block text-xs text-gray-500 ml-4">
                        {result.footnotes[n]}
                      </span>
                    ) : null
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

/* Core curriculum: per-area hours have/need, filled by any planned course in that pool. */
function CoreResult({ core }) {
  if (!core || core.length === 0) return null
  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      <div className="bg-dark-semester p-4">
        <div className="text-xs uppercase tracking-wide text-gray-400">University Requirements</div>
        <div className="text-lg font-semibold text-gray-100">Core Curriculum</div>
        <p className="text-xs text-gray-500 mt-1">
          Courses required by your major count here too — a core course does not have to be
          taken separately.
        </p>
      </div>
      <div className="p-4 space-y-4">
        {core.map((category) => (
          <div key={category.category}>
            <div className="text-sm font-medium text-gray-300 mb-2">
              {category.name}
              {category.remaining > 0 && (
                <span className="text-amber-400"> — {category.remaining} hours remaining</span>
              )}
            </div>
            <div className="space-y-1">
              {category.areas.map((area) => (
                <div
                  key={area.name}
                  className="flex items-center justify-between text-sm border-b border-gray-800 py-1"
                >
                  <span className={area.met ? "text-emerald-300" : "text-gray-300"}>
                    {area.met ? "✓ " : ""}
                    {area.name}
                  </span>
                  <span className={area.met ? "text-emerald-400" : "text-amber-400"}>
                    {area.have}/{area.need} hrs
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
