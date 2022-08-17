import multer from 'multer'
import multerS3 from 'multer-s3'
import { BucketType } from '../types'
import {
  PutObjectCommand,
  GetObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'

import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3 = new S3Client({
  endpoint: 'https://' + process.env.STORAGE_ENDPOINT,
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

const _upload = (bucket: BucketType) =>
  multer({
    storage: multerS3({
      s3,
      bucket: bucket,
      metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname })
      },
      acl: 'public-read',
      key: function (req, file, cb) {
        cb(null, `${req.tokenData?.userId}/${file.originalname}`)
        //userId/filename
      },
    }),
    limits: {
      fileSize: 10 * oneMB,
    },
  })

export const upload = ({
  fileName,
  bucket,
}: {
  fileName: string
  bucket: BucketType
}) => _upload(bucket).single(fileName)

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
