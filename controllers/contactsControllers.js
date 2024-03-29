import * as contactsService from "../services/contactsServices.js";

import HttpError from "../helpers/HttpError.js";

import ctrlWrapper from "../decorators/ctrlWrapper.js";

export const getAllContacts = ctrlWrapper(async (req, res) => {
  const { _id: owner } = req.user;
  const result = await contactsService.listContacts({owner});
  res.json(result);
});

export const getOneContact = ctrlWrapper(async (req, res) => {
  const { id } = req.params;
  const { _id: owner } = req.user;
  // const result = await contactsService.getContactById(id);
  const result = await contactsService.getOneContact({_id: id, owner});
  if (!result) {
    throw HttpError(404, "Not found");
  }
  res.json(result);
});

export const deleteContact = ctrlWrapper(async (req, res) => {
  const { id } = req.params;
  const { _id: owner } = req.user;

  const result = await contactsService.removeOneContact({_id: id, owner});
  if (!result) {
    throw HttpError(404, "Not found");
  }
  res.status(200).json(result);
});

export const createContact = ctrlWrapper(async (req, res) => {
  const { _id: owner } = req.user;
  const result = await contactsService.addContact({ ...req.body, owner });
  res.status(201).json(result);
});

export const updateContactById = ctrlWrapper(async (req, res) => {
  const { id } = req.params;
  const { _id: owner } = req.user;

  if (Object.keys(req.body).length === 0) {
    throw HttpError(400, "Body must have at least one field");
  }

  const result = await contactsService.updateOneContact({_id: id, owner}, req.body);
  if (!result) {
    throw HttpError(404, "Not found");
  }
  res.status(200).json(result);
});

export const updateContactStatus = ctrlWrapper(async (req, res) => {
  const { id } = req.params;

  if (
    !Object.keys(req.body).includes("favorite") ||
    Object.keys(req.body).length !== 1
  ) {
    throw HttpError(400, "Body must have only favorite field");
  }

  const result = await contactsService.updateContactById(id, req.body);
  if (!result) {
    throw HttpError(404, "Not found");
  }
  res.status(200).json(result);
});
