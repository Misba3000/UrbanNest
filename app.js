const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listeningSchema } = require("./schema.js");
const Review = require("./models/review");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
    .then(() => {
        console.log("connected to Db");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

app.get("/", (req, res) => {
    res.send("Hi I am here");
});

//middleware to check/ validate listing request
const validateListing = (req, res, next) => {
    console.log("Hit", req.body);
    let { error } = listeningSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        console.log(error);
        throw new ExpressError(400, errMsg);
    } else {
        console.log("hitttt..");
        next();
    }
};
// index route
app.get(
    "/listings",
    wrapAsync(async (req, res) => {
        try {
            const allListings = await Listing.find({});
            res.render("listings/index", { allListings });
        } catch (err) {
            console.log(err);
            res.status(400).send("Bad Request");
        }
    })
);

//create new route to create a form to add new
app.get("/listings/new", (req, res) => {
    res.render("listings/new");
});

// show route
app.get(
    "/listings/:id",
    wrapAsync(async (req, res, next) => {
        try {
            let { id } = req.params;
            const listing = await Listing.findById(id);
            res.render("listings/show", { listing });
        } catch (err) {
            next(err); // Pass error to error-handling middleware
        }
    })
);

//post - listings route (beacause data is not save in get request form )
app.post(
    "/listings",
    validateListing,
    wrapAsync(async (req, res, next) => {
        //first by req.body get all form data
        //way1 - let {title,description,image,price,location,country}= req.body; but way
        // 2-> here we are creating instance

        const newListing = new Listing(req.body.listing);
        await newListing.save();
        res.redirect("/listings");
    })
);

//update-on edit request render a form and then send that to update route and make change in database
//Edit Route
app.get(
    "/listings/:id/edit",
    wrapAsync(async (req, res) => {
        let { id } = req.params;
        const listing = await Listing.findById(id);
        console.log("in edit form ");
        console.log(listing);
        res.render("listings/edit.ejs", { listing });
    })
);

//put request - update route
app.put(
    "/listings/:id",
    validateListing,
    wrapAsync(async (req, res) => {
        let { id } = req.params;
        console.log("hit", req.params);

        // 2nd parameter here - updated data for the listing, coming from the form submission (req.body).
        await Listing.findByIdAndUpdate(id, { ...req.body.listing });
        console.log("in edit update route");
        res.redirect(`/listings/${id}`);
    })
);

//delete request from show.ejs button
app.delete(
    "/listings/:id",
    wrapAsync(async (req, res) => {
        let { id } = req.params;
        let deletedListing = await Listing.findByIdAndDelete(id);
        console.log(deletedListing);
        res.redirect("/listings");
    })
);

// Reviews
app.post(
    "/listings/:id/reviews",
    wrapAsync(async (req, res) => {
        let listing = await Listing.findById(req.params.id);
        let newReview = new Review(req.body.review);
        // now we add into listing array i.e creating - new review
        listing.reviews.push(newReview);

        await newReview.save();
        await listing.save();

        res.redirect(`/listings/${listing._id}`);
    })
);

app.all("*", (req, res, next) => {
    next(new ExpressError(404, "page not found !"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    // res.status(statusCode).send(message);
    res.status(statusCode).render("listings/error", { err });
});

// app.get("/testListing",async (req,res)=>{
//     //here we will try to make new document sample
//     let sampleListing = new Listing({
//         title:"My new villa",
//         description:"By the beach",
//         price:1200,
//         location:"Calangute Goa",
//         country:"India"
//     });
//     await sampleListing.save();
//     console.log("SAMPLE SAVE TO DB ");
//     res.send("Succesfull testing ");
// });
app.listen(8080, (req, res) => {
    console.log("sever is listening.... on port 8080");
});
