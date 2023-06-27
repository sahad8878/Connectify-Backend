const mongoose = require('mongoose')
// const url = process.env.MONGO_DB_LOCAL_STRING 
const url = process.env.MONGO_DB_DATABASE_STRING

const connect = mongoose.connect(url,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
})

connect.then(db => {
     console.log("connected to db");
}).catch(err => {
    console.log(err);
})