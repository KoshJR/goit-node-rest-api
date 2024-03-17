import Contact from "../models/Contact.js";

export const listContacts = (filter = {}) => Contact.find(filter);

export const addContact = (data) => Contact.create(data);

// export const getContactById = (id) => Contact.findById(id);

export const getOneContact = (filter) => Contact.findOne(filter);

// export const removeContact = (id) => Contact.findByIdAndDelete(id);

export const removeOneContact = (filter) => Contact.findOneAndDelete(filter);

// export const updateContactById = (id, data) =>
//   Contact.findByIdAndUpdate(id, data);

export const updateOneContact = (filter, data) =>
  Contact.findOneAndUpdate(filter, data);
