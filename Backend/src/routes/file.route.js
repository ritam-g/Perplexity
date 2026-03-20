import express from "express";
import { uploadFileController } from "../controller/file.controller.js";
import upload from "../middleware/uplode.middleware.js";


const fileRouter = express.Router();

/*
  👉 upload.single("file")
  means frontend must send:
  form-data → key = "file"
*/
fileRouter.post("/upload", upload.single("file"), uploadFileController);

export default fileRouter;