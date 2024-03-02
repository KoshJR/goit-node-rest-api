import Joi from "joi";

export const createContactSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().required(),
    phone: Joi.string().required()


})

export const updateContactSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string(),
  phone: Joi.string(),
})
  .or("name", "email", "phone")
  .messages({
    "object.missing":
      'At least one of the fields "name", "email", or "phone" must be provided',
  });