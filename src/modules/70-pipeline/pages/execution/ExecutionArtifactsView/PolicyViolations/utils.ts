import { queryParamDecodeAll, useQueryParamsOptions } from '@common/hooks/useQueryParams'

export type TableQueryParams = {
  searchTerm?: string
  page?: number
  size?: number
}

export const ENFORCEMENT_VIOLATIONS_PAGE_SIZE = 20
export const ENFORCEMENT_VIOLATIONS_PAGE_INDEX = 0
export const ENFORCEMENT_VIOLATIONS_DEFAULT_SORT = 'name'
export const ENFORCEMENT_VIOLATIONS_DEFAULT_SORT_ORDER = 'ASC'

export const useEnforcementViolationsQueryParamOptions = () => {
  return useQueryParamsOptions({
    page: ENFORCEMENT_VIOLATIONS_PAGE_INDEX,
    size: ENFORCEMENT_VIOLATIONS_PAGE_SIZE,
    sort: ENFORCEMENT_VIOLATIONS_DEFAULT_SORT,
    order: ENFORCEMENT_VIOLATIONS_DEFAULT_SORT_ORDER,
    searchTerm: ''
  })
}

export type PageOptions = {
  page: number
  size: number
  sort: string
  order: string
  searchTerm: string | undefined
}

export const getQueryParamOptions = () => ({
  parseArrays: true,
  decoder: queryParamDecodeAll(),
  processQueryParams(params: PageOptions): PageOptions {
    return {
      ...params,
      page: params.page ?? ENFORCEMENT_VIOLATIONS_PAGE_INDEX,
      size: params.size ?? ENFORCEMENT_VIOLATIONS_PAGE_SIZE,
      sort: params.sort ?? ENFORCEMENT_VIOLATIONS_DEFAULT_SORT,
      order: params.order ?? ENFORCEMENT_VIOLATIONS_DEFAULT_SORT_ORDER
    }
  }
})
