const { bulkInsert } = require("../../postgresql_prototype/migration_tools/utils"); 
const { Pool } = require('pg');

//function bulkInsert (client, table, arrayOfObj, batchSize)

/*
general rule for parser functions
IN: parent node, current node, entire string
OUT: group of children or child nodes 
*/

/*
END RESULT
{
    "type": "PREREQ", //(example)
    "children": [
        {
            "type": "CLAUSE", 
            "children":  [ 
                {
                    "type": DISJUNCTION,
                    "children": [
                        {

                        }
                    ]         
                }
            ]
        },
        {"type": "CLAUSE", "children": [ {} ] },
        {"type": "CLAUSE", "children": [ {} ] },
    ]
}
*/

/*
note: if no delimiters are found, pass str on as child
*/
function parseSyntaxTreeGeneric(str, delimiters, protectedWords, childFunction, reformatterFunction){
    let protectedMap = new Map();
    let maskedText = str;

    protectedWords.forEach((word, i) => {
        const placeholder = "~".repeat(word.length);
        protectedMap.set(placeholder, word);
        maskedText = maskedText.replaceAll(word, placeholder);
    })
    // console.log(str);
    // console.log(maskedText);


    let children = [];

    // console.log(delimiters);
    let validNextIndexes = delimiters.map((delimiter) => {
        return maskedText.indexOf(delimiter);
    });
    let previousSmallestIndex = 0;
    let filtered = validNextIndexes.filter(x => x !== -1);
    let smallestValidIndex = filtered.length > 0 ? Math.min(...filtered) : str.length;

    while(smallestValidIndex !== -1){
        let childStr = str.slice(previousSmallestIndex, smallestValidIndex);
        childStr = reformatterFunction(childStr);
        const child = childFunction(childStr);
        // console.log("parseSyntaxTreeGeneric: CHILDSTR -> ", childStr);
        // console.log("parseSyntaxTreeGeneric: CHILD -> ", child);
        // indicies.push(smallestValidIndex);
        previousSmallestIndex = smallestValidIndex;
        validNextIndexes = delimiters.map((delimiter) => {
            return maskedText.indexOf(delimiter, smallestValidIndex + 1);
        });
        filtered = validNextIndexes.filter(x => x !== -1);
        smallestValidIndex = filtered.length > 0 ? Math.min(...filtered) : -1; 
        children.push(child);
    }

    if (previousSmallestIndex < str.length) {
        let lastStr = str.slice(previousSmallestIndex);
        lastStr = reformatterFunction(lastStr);
        children.push(childFunction(lastStr));
    }

    // console.log(children);
    return children;
}

function parseCourse(str){
    // const children = parseSyntaxTreeGeneric(str, [",", "and"], [], parseCourseList, (str => str));
    // console.log("COURSE STR: ", str);
    // console.log("COURSE CHILDREN: ", [str]);
    return {
        type: "COURSE",
        children: [str]
    }
}

function parseCourseList(str){
    const children = parseSyntaxTreeGeneric(str, [",", "and", "or"], ["Grade of C or better in", "grade of C or better in"], parseCourse, (str => {
        const str2 = str.replaceAll(",", "").replaceAll(" ", "");
        const str3 = str2.indexOf("or") == 0 ? str2.slice(2) : str2;
        const str4 = str3.indexOf("and") == 0 ? str3.slice(3) : str2
        return str4;
    }));
    console.log("COURSE_LIST STR: ", str);
    console.log("COURSE_LIST CHILDREN: ", children);
    return {
        type: "COURSE_LIST",
        children: [str]
    }
}

function parseCondition(str){
    const children = parseSyntaxTreeGeneric(str, ["junior", "approval of", "junior or senior classification", "Grade of C or better in", "grade of C or better in", "senior classification", "concurrent enrollment"], [], parseCourseList, (str => str));
    console.log("CONDITION STR: ", str);
    console.log("CONDITION CHILDREN: ", children);
    return {
        type: "CONDITION",
        children: [str]
    }
}

function parseConjunction(str){
    // const delimiterIndicies = delimiterIndexes(str, [",", "and"], []);
    const children = parseSyntaxTreeGeneric(str, [",", "and"], [], parseCondition, (str => str));

    // for(let i = 1; i < delimiterIndicies.length; i ++){
        // let clauseStr = str.slice(delimiterIndicies[i-1], delimiterIndicies);
        // const clauseObj = EBNFGrammarRuleToParserFunction["CONDITION"](clauseStr);
        // children.push(clauseObj);
    // }
    console.log("CONJUNCTION STR: ", str);
    console.log("CONJUNCTION CHILDREN: ", children);

    return {
        type: "CONJUNCTION",
        children
    };
}

function parseDisjunction(str){
    const children = parseSyntaxTreeGeneric(str, [",or"], ["grade of C or better in", "Grade of C or better in", "Junior", "junior", "senior", "Senior", "for"], parseConjunction, ((str) => str));
    // const children = [];
    
    // for(let i = 1; i< delimiterIndicies.length; i++){
    //     let clauseStr = str.slice(delimiterIndicies[i-1], delimiterIndicies[i]);
    //     if(clauseStr.slice(0, 3) == "or "){
    //         clauseStr = clauseStr.slice(2);
    //     }
    //     if(clauseStr[0] == " "){
    //         clauseStr = clauseStr.slice(1);
    //     }
    //     const clauseObj = EBNFGrammarRuleToParserFunction["CONJUNCTION"](clauseStr); //is 
    //     children.push(clauseObj);
    // }

    console.log("DISJUNCTION  STR: ", str);
    console.log("DISJUNCTION CHILDREN: ", children);
    
    return {
        type: "DISJUNCTION",
        children
    };
}

function parseClause(str){
    const child1 = parseDisjunction(str);
    console.log("CLAUSE STR: ", str);
    console.log("CLAUSE CHILDREN: ", [child1]);
    return { 
        type: "CLAUSE",
        children: [
            child1   
        ]
    };
}

function parsePrereq(str) {    
    const childFunction = EBNFGrammarRuleToParserFunction["CLAUSE"];
    const reformatterFunction = (str) => {
        if(str[0] == ";" && str[1] == " ") str = str.slice(2);
        return str;
    }
    const children = parseSyntaxTreeGeneric(str, [";"], [], childFunction, reformatterFunction);
    // const children = [];
    
    // for(let i = 1; i < delimiterIndicies.length;i++){
    //     let clauseStr = str.slice(delimiterIndicies[i-1], delimiterIndicies[i]);
    //     if(clauseStr[0] == ";" && clauseStr[1] == " "){
    //         clauseStr = clauseStr.slice(2);
    //     }
    //     const clauseObj = EBNFGrammarRuleToParserFunction["CLAUSE"](clauseStr); //is 
    //     children.push(clauseObj);
    // }
    console.log("PREREQ STR: ", str);
    console.log("PREREQ CHILDREN: ", children);

    return {
        type: "PREREQ",
        children
    };
}

//keep in mind that parsing is DFS - often the grammar rules higher in the syntax tree in an EBNF grammar rule set 
//will appear to overwrite the rules lower in the syntax tree(closer to the leaves), but it will not, because the leaves of
//clause1 are always parsed before clause2 is even considered.
const EBNFGrammarRuleToParserFunction = {
    "PREREQ": parsePrereq,
    "CLAUSE": parseClause,
    "DISJUNCTION": parseDisjunction,
    "CONJUNCTION": parseConjunction,
    "CONDITION": parseCondition,
    "COURSE_LIST": parseCourseList,
    "COURSE": parseCourse,
};
const populateSyntaxTree = async () => {
    const pgPool = new Pool({
        user: process.env.DB_USERNAME,
        host: "localhost",
        database: "mydb",
        password: process.env.DB_PASSWORD,
        port: 5432
    });
    const client = await pgPool.connect();

    //Prerequisite or corequisite: ACCT 665.
    const sql = 
    `
        SELECT id, description 
        FROM course_explorer.courses
        WHERE (
            SELECT count(*)
            FROM regexp_matches(description, 'Prerequisite', 'g')
        ) = 1
    `;
    const params = [];

    const result = await client.query(sql, params);
    const rows = result.rows;

    const prereqEntries = rows.map((row) => {
        const { id: course_id, description } = row;
        const wordIndex1 = description.indexOf("Prerequisite");
        const substring1 = description.slice(wordIndex1);
        const wordIndex2 = substring1.indexOf(" ");
        const str = substring1.slice(wordIndex2);
        
        const syntaxTree = parsePrereq(str);
        console.log(syntaxTree, "\n\n");
    });

    // bulkInsert(client, "course_explorer.degree_prereqs", prereqEntries, 1000);
    client.release();
    await pgPool.end();
}

// const str = "ACCT 315 or ACCT 327; FINC 341.";
// const str2 = "Grade of C or better in COMM 205 or COMM 243 or ENGL 210; grade of C or better in ECEN 314, ECEN 325, and ECEN 350/CSCE 350 or CSCE 350/ECEN 350; grade of C or better in ECEN 303, ECEN 322, and ECEN 370, or grade C or better in CSCE 315 or CSCE 331, and ECEN 303 or STAT 211, and ECEN 449 or CSCE 462, or concurrent enrollment; senior classification.";
// const syntaxTree = parsePrereq(str);
// const syntaxTree2 = parsePrereq(str2);
// console.log(syntaxTree, "\n\n\n");
// console.log(syntaxTree2);

// populateSyntaxTree();

// const str3 = "Junior or senior classification";
// const syntaxTree3 = parsePrereq(str3);
// console.log(syntaxTree3)

module.exports = {
    parsePrereq,
    parseClause,
    parseDisjunction,
    parseConjunction,
    parseCondition,
    parseCourse,
    parseCourseList,
}