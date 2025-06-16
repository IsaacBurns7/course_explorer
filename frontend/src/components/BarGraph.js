//this will probably use a courses context, 
//and then use the specific professor name to find matching sections
//then, total all the sections to find relevant data

//in courses, find course with courseId
//for that course, find professors with professorId

function BarGraph({professorId, courseId}){

    //const data = callBackendForInfoByCourse(dept, number)andProfessorID(name?)

    const data = {
        labels: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F', 'W'],
        datasets: [{
            label: '# of Students',
            data: [2500, 6700, 4300, 2200, 1900, 1700, 900, 800, 700, 300, 250, 200, 600, 500],
            backgroundColor: [
            '#7CFC00', '#7FFF00', '#ADFF2F', '#C0FF3E', '#FFFF66', '#FFE066', 
            '#FFD700', '#FFCC00', '#FFB400', '#FF9933', '#FF6600', '#FF4500', 
            '#FF0000', '#C0C0C0'
            ]
        }]
    };
}

export default BarGraph;