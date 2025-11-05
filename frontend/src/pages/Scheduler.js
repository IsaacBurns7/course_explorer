import React, { useState } from 'react';

const Scheduler = () => {
    const { plannerData } = usePlannerStore();
    const [schedules, setSchedules] = useState([]);
    const [semester, setSemester] = useState("Spring 2026"); 
    const [courseWeights, setCourseWeights] = useState({});
    const [fixedProfessors, setFixedProfessors] = useState({});
    const [selectedSchedule, setSelectedSchedule] = useState(0);
    const [loading, setLoading] = useState(false);

    const handleWeightChange = (course, field, value) => {

    };

    const handleProfToggle = (course, profId) => {

    };

    const getOptimalSchedule = async () => {

    };
}
export default Scheduler;