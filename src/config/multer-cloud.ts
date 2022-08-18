import multer from 'multer'
import multerS3 from 'multer-s3'
import {
  PutObjectCommand,
  GetObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'

import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Request, Response } from 'express'
import { STORAGE_ENDPOINT } from './constants'
import path from 'path'
import { ValidationError } from '../utils/Error'

const s3 = new S3Client({
  endpoint: STORAGE_ENDPOINT,
  credentials: {
    accessKeyId: process.env.STORAGE_KEY as string,
    secretAccessKey: process.env.STORAGE_SECRET as string,
  },
})

const getSignedUrlforGet = () => {
  getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: 'faceId',
      Key: '',
    }),
    { expiresIn: 3600 },
  )
}
const getSignedUrlforPut = () => {
  getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: 'faceId',
      Key: '',
    }),
    { expiresIn: 3600 },
  )
}
//Copy faceId Object to photourl when

const oneMB = 1024 * 1024

const _upload = ({
  getKey,
  type,
}: {
  getKey: (file: Express.Multer.File) => string
  type: 'image'
}) =>
  multer({
    storage: multerS3({
      s3,
      bucket: 'hairsap',
      // metadata: function (req, file, cb) {
      //   cb(null, { fieldName: file.fieldname })
      // },
      acl: 'private',
      key: (_req, file, cb) => {
        cb(null, getKey(file))
      },
    }),
    limits: {
      fileSize: 10 * oneMB,
    },
    fileFilter: (_req, file, cb) => {
      if (type === 'image') {
        const filetypes = /jpeg|jpg|png|gif/
        if (!filetypes.test(path.extname(file.originalname).toLowerCase()))
          return cb(new ValidationError('file must be an image'))
        if (!filetypes.test(file.mimetype))
          return cb(new ValidationError('file must be an image'))
      }

      cb(null, true)
    },
  })

export const uploadFaceId = ({
  fieldName,
  getKey,
  req,
  res,
}: {
  fieldName: string
  getKey: (file: Express.Multer.File) => string
  req: Request
  res: Response
}) =>
  new Promise((resolve, reject) => {
    _upload({ getKey, type: 'image' }).single(fieldName)(req, res, (err) => {
      if (err) return reject(err)
      resolve(undefined)
    })
  })

// const params = {
//   Bucket: "example-space/example-folder/", // The path to the directory you want to upload the object to, starting with your Space name.
//   Key: "hello-world.txt", // Object key, referenced whenever you want to access this file later.
//   Body: "Hello, World!", // The object's contents. This variable is an object, not a string.
//   ACL: "private", // Defines ACL permissions, such as private or public.
//   Metadata: { // Defines metadata tags.
//     "x-amz-meta-my-key": "your-value"
//   }
// };

// // Step 4: Define a function that uploads your object using SDK's PutObjectCommand object and catches any errors.
// const uploadObject = async () => {
//   try {
//     const data = await s3Client.send(new PutObjectCommand(params));
//     console.log(
//       "Successfully uploaded object: " +
//         params.Bucket +
//         "/" +
//         params.Key
//     );
//     return data;
//   } catch (err) {
//     console.log("Error", err);
//   }
// };

// // Step 5: Call the uploadObject function.
// uploadObject();
