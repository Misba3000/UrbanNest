//this is not mongoose schema this server side validation schema
const Joi = require("joi");
// now we'll be listing our client side schema

//we want object in Joi and it suppose to be listing object and this object has to be required
module.exports.listeningSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        country: Joi.string().required(),
        location: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.alternatives().try(
            Joi.object({
                url: Joi.string().allow("", null),
            }),
            Joi.string().allow("", null) // 👈 Allows an empty string as well
        ),
        
    }).required(),
});

module.exports.listeningSchema;
