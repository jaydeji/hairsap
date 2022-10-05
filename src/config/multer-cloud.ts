import {
  S3Client,
  CopyObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3'
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'
// import {} from '@aws-sdk/s3-request-presigner'
import { STORAGE_ENDPOINT } from './constants'
import path from 'path'
import { ValidationError } from '../utils/Error'
import { logger, uniqueId } from '../utils'

const s3 = new S3Client({
  endpoint: STORAGE_ENDPOINT,
  credentials: {
    accessKeyId: process.env.STORAGE_KEY,
    secretAccessKey: process.env.STORAGE_SECRET,
  },
  region: process.env.STORAGE_REGION,
})

export const copyObject = ({
  source,
  key,
}: {
  source: string
  key: string
}) => {
  s3.send(
    new CopyObjectCommand({
      Bucket: 'hairsap',
      CopySource: source,
      Key: key,
      ACL: 'public-read',
    }),
  )
}

const oneMB = 1024 * 1024

export const upload = async (opts: {
  file: Express.Request['files']
  acl?: 'private' | 'public-read'
  prefix: string
  type: 'image' | 'video'
  fieldName: string
  optional?: boolean
}) => {
  const { file, acl, prefix, type, fieldName, optional } = opts

  if (!file?.name && !optional)
    throw new ValidationError(fieldName + ' does not exist')
  if (!file?.name) return {}
  if (type === 'image') {
    const filetypes = /jpeg|jpg|png|gif/
    if (!filetypes.test(path.extname(file.name as any).toLowerCase()))
      throw new ValidationError('file must be an image')
    if (!filetypes.test(file.mimetype as any))
      throw new ValidationError('file must be an image')
  }

  if (type === 'image' && (file.size as any) > oneMB * 10)
    throw new ValidationError('file size should not be more than 10mb')
  if (type === 'video' && (file.size as any) > oneMB * 30)
    throw new ValidationError('file size should not be more than 30mb')

  const originalName = file.name as unknown as string
  const fileContent = Buffer.from(file.data as any, 'binary')
  const key = prefix + '_' + originalName

  await s3.send(
    new PutObjectCommand({
      Bucket: 'hairsap',
      Key: key,
      ACL: acl || 'private',
      Body: fileContent,
      ContentDisposition: `attachment; filename="${originalName}"`,
    }),
  )

  logger.info({ key }, 'File uploaded')

  return {
    key,
    originalName,
  }
}

export const getChatImageSignedUrl = ({ userId }: { userId: number }) => {
  const key = `chatphoto/${userId}/${uniqueId()}/`
  return createPresignedPost(s3, {
    Bucket: 'hairsap',
    Key: key + '${filename}',
    Expires: 3600,
    Conditions: [
      { acl: 'public-read' },
      ['content-length-range', 1, oneMB * 10],
      ['starts-with', '$Content-Type', 'image/'],
      ['starts-with', '$key', key],
      ['starts-with', '$Content-Disposition', 'attachment'],
    ],
    Fields: {
      acl: 'public-read',
      'Content-Disposition': 'attachment filename="${filename}"',
    },
    // ContentType: 'multipart/form-data',
  })
}

// const getChatImagePresignedUrl = async (body: { userId: number }) => {
//   z.object({ userId: z.number() }).parse(body)
//   try {
//     const { url, fields } = await getChatImageSignedUrl(body)

//     return {
//       originalFilename: filename,
//       uploadedDocumentUrl: `https://${process.env.S3_CHARGEBACK_DOCUMENTS_BUCKET_NAME}.s3.eu-central-1.amazonaws.com/${uniqueFilename}`,
//       postUrl: url,
//       fields: fields,
//     }
//   } catch (error) {
//     logger.err(error)
//     throw new InternalError()
//   }
// }

// export const uploadFaceId = ({
//   fieldName,
//   getKey,
//   req,
//   res,
// }: {
//   fieldName: string
//   getKey: (file: Express.Multer.File) => string
//   req: Request
//   res: Response
// }) =>
//   new Promise((resolve, reject) => {
//     _upload({ getKey, type: 'image' }).single(fieldName)(req, res, (err) => {
//       if (err) return reject(err)
//       resolve(undefined)
//     })
//   })

// export const uploadSamplePhoto = ({
//   fieldName,
//   getKey,
//   req,
//   res,
// }: {
//   fieldName: string
//   getKey: (file: Express.Multer.File) => string
//   req: Request
//   res: Response
// }) =>
//   new Promise((resolve, reject) => {
//     _upload({ getKey, type: 'image' }).fields([
//       { name: fieldName, maxCount: 1 },
//     ])(req, res, (err) => {
//       if (err) return reject(err)
//       resolve(undefined)
//     })
//   })

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
