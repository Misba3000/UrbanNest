const mongoose = require('mongoose');
const initData = require('./data.js');
const Listing = require('../models/listing');

const MONGO_URL ="mongodb://127.0.0.1:27017/wanderlust";

main()
.then(()=>{
    console.log("connected to Db");
})
.catch((err)=>{
    console.log(err);
});

async function main(){
    await mongoose.connect(MONGO_URL);
}

const initDb = async ()=>{
    //firstly if any data is there in the database so firstly we'll delete it
    await Listing.deleteMany({});
    //once complete data gets deleted then we'll add our data
    await Listing.insertMany(initData.data);
    
    console.log("Data has initialized");
};

initDb();

//now we can create our routes 