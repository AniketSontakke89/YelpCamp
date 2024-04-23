//ANYTIME WE WANT TO SEED OUR DATABASE WE WILL RUN THIS FILE

const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database Seeded");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for(let i = 0;i<200;i++){
        const random1000 = Math.floor(Math.random()*1000);
        const price = Math.floor(Math.random()*20)+10;
        const camp = new Campground({
            author: '66250a9740626a6f7589cd74',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: `https://source.unsplash.com/random/300x300?camping,${i}` ,
            description:' Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quibusdam, facilis laboriosam ipsam voluptatibus voluptas placeat. Odio optio molestiae praesentium eum laborum ab inventore! Itaque magni minima vero, dolores laborum obcaecati.',
            price:price,
            geometry: { 
                type: 'Point', 
                coordinates: [ 
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                 ] 
            },
            images:[
                    {
                      url: 'https://res.cloudinary.com/djh3wngik/image/upload/v1713522114/YelpCamp/hijarqtpestftmmvy75k.png',
                      filename: 'YelpCamp/hijarqtpestftmmvy75k'
                    }
            ]
        });
        await camp.save();
    }
}

seedDB().then(()=>{
    mongoose.connection.close();
});