const Joi = require("joi");

const userValidationSchema = Joi.object({
  memberId: Joi.number().integer().optional(), // Allow optional for unique constraints not defined in Joi
  name: Joi.string().required(),
  birthdate: Joi.date().optional(),
  avatar: Joi.string().optional(), // Assuming avatar is a URL, validate it as such
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(), // Adding a minimum length for security
  gender: Joi.string().valid("Male", "Female", "Other").optional(), // Define accepted genders
  role: Joi.string().valid("admin", "user").required(), // Define user role
  phone: Joi.string().optional(), // Accepts numbers between 10-15 digits
  address: Joi.string().optional(),
  about: Joi.string().optional(),
  followers: Joi.number().integer().min(0).default(0),
  following: Joi.number().integer().min(0).default(0),
  isDeleted: Joi.boolean().default(false),
  createdAt: Joi.number().default(new Date().getTime()),
  modifiedAt: Joi.number().default(new Date().getTime()),
});

module.exports = userValidationSchema;
