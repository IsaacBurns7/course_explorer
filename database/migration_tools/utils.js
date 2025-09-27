function bulkInsert(client, table, arrayOfObj, batchSize){
     // console.log(arrayOfObj, Array.isArray(arrayOfObj), typeof(arrayOfObj), arrayOfObj.length); //51911 length
    if(typeof arrayOfObj !== "object" || !Array.isArray(arrayOfObj) || arrayOfObj === null){
        console.log("bulkInsert failed, arrayofObj was of unexpected type");
        return;
    }
    if(arrayOfObj.length === 0){
        console.log("bulkInsert failed, array was of length 0");
        return;
    } 
    const keys = Object.keys(arrayOfObj[0]);
    // console.log(keys, keys.length);
    if(keys.length === 0){
        console.log("bulkInsert failed, keys were of length 0");
        return;
    }
    const cols = keys.join(", ");
    const maxBatchSize = 65536 / keys.length;
    if(batchSize > maxBatchSize){
        console.log("bulkInsert may FAIL, batch size exceeds limit");
    }
    // console.log(placeholders); //986309 length
    // console.log(values, values.length); //986309 length

    //note: the below "ON CONFLICT DO NOTHING", requires the table have a PRIMARY KEY set, so the engine can find the correct constraint to avoid duplicate inserts
    //note: values.length, and final $ on placeholder sohuld be the same(for alignment)
    //additionally, arrayOfObj * Object.keys(arrayOfObj[<any>]).length MUST EQUAL values.length (again for alignment)
    
    //SPECIAL NOTE: batch size must be < 65536 / keys.length
    for(let i = 0; i < arrayOfObj.length; i+= batchSize){
        const batch = arrayOfObj.slice(i,i + batchSize);
        const placeholders = batch.map((_, i) => {
        const base = i * keys.length;
            return `(${keys.map((_, j) => `$${base + j + 1}`).join(", ")})`;
        }).join(", ");
        const values = batch.flatMap((obj, _) => {
            return Object.values(obj);
        });
        const sql = `INSERT INTO ${table} (${cols}) VALUES ${placeholders} ON CONFLICT DO NOTHING`;
        const params = values;
        client.query(sql, params);
    }  
      
    return 1;
}

module.exports = { bulkInsert };