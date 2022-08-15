import { PageReqSchema, PageReq } from '../schemas/request/Page'

const paginate = (body: unknown) => {
  const page = PageReqSchema.parse(body)
  return { ...page, skip: (page.page - 1) * page.perPage }
}

const getPageMeta = ({
  total,
  skip,
  perPage,
  page,
}: PageReq & { total: number; skip: number }) => ({
  total,
  skipped: skip,
  perPage: perPage,
  page: page,
  pageCount: Math.ceil(total / perPage),
})

export { paginate, getPageMeta }
