import Joi from "joi";

export const createContactSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),
  phone: Joi.string().required(),
  favorite: Joi.boolean(),


});

export const updateContactSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string(),
  phone: Joi.string(),
  favorite: Joi.boolean(),
})
  .or("name", "email", "phone", "favorite")
  .messages({
    "object.missing":
      'At least one of the fields "name", "email", "phone, or "favorite" must be provided',
  });

export const updateContactStatusSchema = Joi.object({
    favorite: Joi.boolean().required(),
  }).unknown(false)