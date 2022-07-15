//const { EnvironmentContext } = require('twilio/lib/rest/serverless/v1/service/environment')


const mongoClient=require('mongodb').MongoClient
const state={   
    db:null
}




module.exports.connect = function(done){
    const url = process.env.mongoClint
    //'mongodb://0.0.0.0:27017/'
    const dbname='Sparta-Tavera'

mongoClient.connect(url,(err,data)=>{
    if(err) return done(err)
    state.db = data.db(dbname)

    done() 
})

}

module.exports.get=function(){
    return state.db
}