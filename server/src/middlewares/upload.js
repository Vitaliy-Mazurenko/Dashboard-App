import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads';
    if (file.fieldname === 'avatar') folder = 'uploads/avatars';
    if (file.fieldname === 'logo') folder = 'uploads/logos';
    fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${file.fieldname}-${req.user.id}-${Date.now()}${ext}`;
    cb(null, name);
  },
});

export const upload = multer({ storage }); 