import multer from 'multer'
import multerS3 from 'multer-s3'
import { S3, Endpoint } from 'aws-sdk'
import { BucketType } from '../types'

const spacesEndpoint = new Endpoint(process.env.STORAGE_ENDPOINT as string)
const s3 = new S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.STORAGE_KEY,
  secretAccessKey: process.env.STORAGE_SECRET,
})

const oneMB = 1024 * 1024

const _upload = (bucket: BucketType) =>
  multer({
    storage: multerS3({
      s3: s3 as any,
      bucket: bucket,
      metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname })
      },
      acl: 'public-read',
      key: function (req, file, cb) {
        cb(null, `${req.tokenData?.userId}/${file.originalname}`)
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
