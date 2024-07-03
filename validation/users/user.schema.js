const joi = require("@hapi/joi");

//get field name similar to request body
const schema = {
    user: joi.object({
        first_name: joi.string().max(100).required(),
        last_name: joi.string().max(100).required(),
        user_contact: joi.number().integer().min(100000000).message("Invalid mobile number!").max(999999999999).message("Invalid mobile number!").required(),
        user_password:joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")).required(),
        user_email:joi.string().email().required()
    })
};

module.exports = schema;
