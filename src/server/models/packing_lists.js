/**
 * ===========================================
 * Export model functions as a module
 * ===========================================
 */
var format = require('pg-format');

module.exports = (dbPoolInstance) => {

    // `dbPoolInstance` is accessible within this function scope

    let generateTempList = (tripInfo,callback)=>{

        let weather_id = parseInt(tripInfo.weather);
        let activity_ids = tripInfo.activities.map(x=>parseInt(x));
        let gender = tripInfo.gender
        let duration = tripInfo.duration
        let filterList = null;
        let finalList = {};
        let availableCategory = null;

        let query = 'SELECT * FROM items';

        dbPoolInstance.query(query,(error,queryResult)=>{
            if (error) {
                console.log("SELECT ALL ITEMS FAIL")
                callback(error, null);
            } else {

                if(queryResult.rows.length>0){
                    console.log("////////////////////////////////")
                    console.log(weather_id)
                    console.log(activity_ids)
                    console.log("////////////////////////////////")
                    //filter out common items
                    filterList = queryResult.rows.filter(x=>x.weather_id === null && x.activity_id === null)
                    //add items with same weather
                    filterList = filterList.concat(queryResult.rows.filter(x=>x.weather_id === weather_id))
                    //add items with same activities
                    filterList = filterList.concat(queryResult.rows.filter(x=>activity_ids.includes(x.activity_id)))
                    filterList = filterList.filter(x=>x.gender === null || x.gender === gender)

                    //remove duplicates
                    filterList = filterList.filter((obj, pos, arr) => {
                        return arr.map(mapObj => mapObj["name"]).indexOf(obj["name"]) === pos;
                    });
                    availableCategory = [...new Set(filterList.map(x => x.category))];
                    for(let i=0;i<availableCategory.length;i++){
                        finalList[availableCategory[i]] = filterList.filter(x=>x.category === availableCategory[i])
                    }

                    callback(null,finalList)

                }else{
                    console.log("SELECT ALL ITEMS NOTHING")
                    callback(null, null);
                }

            }
        })

    }

    let createPackingList = (trip_id,callback) =>{
        let user_id = request.cookies["user_id"];
        let query = 'INSERT INTO packing_lists (user_id,trip_id) VALUES ($1,$2) RETURNING *'

        dbPoolInstance.query(query,arr,(error,queryResult)=>{
            if(error){
                console.log("CREATE PACKING LIST ERROR")
                console.log(error)
                callback(error,null);
            }else{
                if(queryResult.rows.length>0){
                    console.log("CREATE PACKING LIST SUCCESS");
                    callback(null,queryResult.rows[0]);
                }else{
                    console.log("CREATE PACKING LIST RETURNS NULL");
                    callback(null,null);
                }
            }
        })
    }

    let createPackingListItems = (packList,packing_list_id,callback)=>{
        let finalList = []
        for (var key in packList) {
            finalList.concat(packList[key]);
        }

        finalList = finalList.map(x=>[packing_list_id,x.name,x.quantity,x.category])


        let query = format('INSERT INTO packing_list_items (packing_list_id,name,quantity,category) VALUES %L RETURNING *',finalList);

        dbPoolInstance.query(query,(error,queryResult)=>{
            if(error){
                console.log("CREATE PACKING LIST ITEMS ERROR")
                console.log(error)
                callback(error,null);
            }else{
                if(queryResult.rows.length>0){
                    console.log("CREATE PACKING LIST ITEMS SUCCESS");
                    callback(null,queryResult.rows);
                }else{
                    console.log("CREATE PACKING LIST ITEMS RETURNS NULL");
                    callback(null,null);
                }
            }
        })
    }

    return {
        generateTempList,
        createPackingList,
        createPackingListItems

    };
};
