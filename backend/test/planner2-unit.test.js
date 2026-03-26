const { expect } = require('chai');
const {
    parseTime,
    checkOverlap,
    generateMask,
    generateSchedule,
    getMaskBitForTime,
    getTimeForMaskBit,
    findOptimalSchedules,
    resetMaskState
} = require('../controllers/planner2');

describe('planner2 — pure unit tests (no DB)', () => {

    beforeEach(() => {
        resetMaskState();
    });

    describe('parseTime', () => {
        it('parses a standard AM time', () => {
            expect(parseTime('11:30 AM')).to.equal(690);
        });

        it('parses a standard PM time', () => {
            expect(parseTime('02:20 PM')).to.equal(860);
        });

        it('parses 12:00 PM (noon) as 720', () => {
            expect(parseTime('12:00 PM')).to.equal(720);
        });

        it('parses 12:00 AM (midnight) as 0', () => {
            expect(parseTime('12:00 AM')).to.equal(0);
        });
    });

    describe('checkOverlap', () => {
        it('returns false for sections on different days', () => {
            const current = [{ day: 'M', start: '09:00 AM', end: '10:00 AM' }];
            const added  = [{ day: 'T', start: '09:00 AM', end: '10:00 AM' }];
            expect(checkOverlap(current, added)).to.be.false;
        });

        it('returns false for non-overlapping sections on the same day', () => {
            const current = [{ day: 'M', start: '09:00 AM', end: '10:00 AM' }];
            const added  = [{ day: 'M', start: '10:30 AM', end: '11:30 AM' }];
            expect(checkOverlap(current, added)).to.be.false;
        });

        it('returns true for overlapping sections on the same day', () => {
            const current = [{ day: 'M', start: '09:00 AM', end: '10:30 AM' }];
            const added  = [{ day: 'M', start: '10:00 AM', end: '11:00 AM' }];
            expect(checkOverlap(current, added)).to.be.true;
        });

        it('returns false when sections are exactly adjacent (end == start)', () => {
            const current = [{ day: 'W', start: '09:00 AM', end: '10:00 AM' }];
            const added  = [{ day: 'W', start: '10:00 AM', end: '11:00 AM' }];
            expect(checkOverlap(current, added)).to.be.false;
        });
    });

    describe('generateMask / generateSchedule roundtrip', () => {
        it('converts schedule to mask and back, returning the same times', () => {
            const times = [
                { day: 'M', start: '09:00 AM', end: '10:00 AM' },
                { day: 'W', start: '09:00 AM', end: '10:00 AM' }
            ];

            const mask = generateMask(times);
            const recovered = generateSchedule(mask);

            expect(recovered).to.have.lengthOf(2);
            // Compare as sets of day-start-end strings since order may vary
            const toKey = (t) => `${t.day}-${t.start}-${t.end}`;
            const originalKeys = times.map(toKey).sort();
            const recoveredKeys = recovered.map(toKey).sort();
            expect(recoveredKeys).to.deep.equal(originalKeys);
        });
    });

    describe('findOptimalSchedules (DP integration)', () => {
        // Two courses, each with two section options.
        // Course A:
        //   Section A1: MWF 9-10 AM, score 4.0
        //   Section A2: TR 9-10 AM,  score 3.0
        // Course B:
        //   Section B1: MWF 9-10 AM, score 5.0  (conflicts with A1)
        //   Section B2: TR 11-12 PM, score 2.0   (no conflict with either A section)
        //
        // Best non-conflicting combo: A1 (4.0) + B2 (2.0) = 6.0
        // Next: A2 (3.0) + B1 (5.0) = 8.0  — wait, A2 is TR 9-10 and B1 is MWF 9-10 => no conflict!
        // So actually A2+B1 = 8.0 should be #1 and A1+B2 = 6.0 should be #2.

        const coursesMap = {
            'COURSE_A': [
                {
                    professor_id: 'profA1', section_id: 1, crn: '111',
                    professor_score: '4.0',
                    schedule: [
                        { day: 'M', start: '09:00 AM', end: '10:00 AM' },
                        { day: 'W', start: '09:00 AM', end: '10:00 AM' },
                        { day: 'F', start: '09:00 AM', end: '10:00 AM' }
                    ]
                },
                {
                    professor_id: 'profA2', section_id: 2, crn: '222',
                    professor_score: '3.0',
                    schedule: [
                        { day: 'T', start: '09:00 AM', end: '10:00 AM' },
                        { day: 'R', start: '09:00 AM', end: '10:00 AM' }
                    ]
                }
            ],
            'COURSE_B': [
                {
                    professor_id: 'profB1', section_id: 3, crn: '333',
                    professor_score: '5.0',
                    schedule: [
                        { day: 'M', start: '09:00 AM', end: '10:00 AM' },
                        { day: 'W', start: '09:00 AM', end: '10:00 AM' },
                        { day: 'F', start: '09:00 AM', end: '10:00 AM' }
                    ]
                },
                {
                    professor_id: 'profB2', section_id: 4, crn: '444',
                    professor_score: '2.0',
                    schedule: [
                        { day: 'T', start: '11:00 AM', end: '12:00 PM' },
                        { day: 'R', start: '11:00 AM', end: '12:00 PM' }
                    ]
                }
            ]
        };

        it('picks the highest-scoring non-conflicting combination', () => {
            const results = findOptimalSchedules(coursesMap, ['COURSE_A', 'COURSE_B']);

            expect(results).to.have.length.greaterThan(0);
            const best = results[0];
            // A2 (3.0) + B1 (5.0) = 8.0 — no conflict (different days)
            expect(best.total_score).to.equal(8.0);
            const courseIds = best.schedule.map(s => s.course_id).sort();
            expect(courseIds).to.deep.equal(['COURSE_A', 'COURSE_B']);
        });

        it('returns multiple valid schedules sorted by score', () => {
            const results = findOptimalSchedules(coursesMap, ['COURSE_A', 'COURSE_B']);

            expect(results.length).to.be.greaterThan(1);
            // Scores should be in descending order
            for (let i = 1; i < results.length; i++) {
                expect(results[i - 1].total_score).to.be.at.least(results[i].total_score);
            }
        });

        it('never includes conflicting sections in the same schedule', () => {
            const results = findOptimalSchedules(coursesMap, ['COURSE_A', 'COURSE_B']);

            for (const result of results) {
                // Collect all time slots across all sections in this schedule
                const allSlots = result.schedule.flatMap(s => s.schedule);
                // Check no pair overlaps
                for (let i = 0; i < allSlots.length; i++) {
                    for (let j = i + 1; j < allSlots.length; j++) {
                        if (allSlots[i].day === allSlots[j].day) {
                            const s1 = parseTime(allSlots[i].start);
                            const e1 = parseTime(allSlots[i].end);
                            const s2 = parseTime(allSlots[j].start);
                            const e2 = parseTime(allSlots[j].end);
                            const overlaps = s1 < e2 && s2 < e1;
                            expect(overlaps, `slots ${JSON.stringify(allSlots[i])} and ${JSON.stringify(allSlots[j])} overlap`).to.be.false;
                        }
                    }
                }
            }
        });

        it('handles three courses correctly', () => {
            const threeCoursesMap = {
                ...coursesMap,
                'COURSE_C': [
                    {
                        professor_id: 'profC1', section_id: 5, crn: '555',
                        professor_score: '3.5',
                        schedule: [
                            { day: 'M', start: '02:00 PM', end: '03:00 PM' },
                            { day: 'W', start: '02:00 PM', end: '03:00 PM' }
                        ]
                    }
                ]
            };

            const results = findOptimalSchedules(threeCoursesMap, ['COURSE_A', 'COURSE_B', 'COURSE_C']);

            expect(results).to.have.length.greaterThan(0);
            const best = results[0];
            // Best: A2(3.0) + B1(5.0) + C1(3.5) = 11.5
            expect(best.total_score).to.equal(11.5);
            expect(best.schedule).to.have.lengthOf(3);
        });
    });
});
