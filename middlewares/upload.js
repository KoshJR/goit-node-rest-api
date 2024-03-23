import multer from "multer";
import path from "path"

import HttpError from "../helpers/HttpError.js";

const destination = path.resolve("temp");

const storage = multer.diskStorage({
    destination,
    filename: (req, file, callback) => {
        const prefix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const fileName = `${prefix}_${file.originalname}`;
        callback(null, fileName);
    }
});

const limits = {
  fileSize: 1024 * 1024 * 5,
};

const fileFilter = (req, file, callback) => {
  const extension = file.originalname.split(".").pop();
  if (extension === "exe") {
    return callback(HttpError(400, ".exe not valid extension "));
  }
  callback(null, true);
};

const upload = multer({
    storage,
    limits,
    fileFilter
})

export default upload;