import multer from 'multer'

const upload = multer(
    {
        storage: multer.memoryStorage(),
        limits: {
            fileSize: 5 * 1024 * 1024
        },
        //NOTE - restrict uploads to PDF only for resume parsing flow.
        fileFilter: (req, file, cb) => {
            if (file.mimetype !== "application/pdf") {
                return cb(new Error("only pdf files are allowed"))
            }
            //REVIEW - if some clients send `application/octet-stream`, add extension checks as fallback.
            cb(null, true)
        }
    }
)
export default upload