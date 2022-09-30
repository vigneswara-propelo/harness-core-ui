import type { SelectOption } from '@harness/uicore'
import { queryParamDecodeAll } from '@common/hooks/useQueryParams'
import type { FreezeListUrlQueryParams } from '@freeze-windows/types'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE, DEFAULT_PIPELINE_LIST_TABLE_SORT } from '@pipeline/utils/constants'

export const getQueryParamOptions = () => ({
  parseArrays: true,
  decoder: queryParamDecodeAll(),
  processQueryParams(params: FreezeListUrlQueryParams): FreezeListUrlQueryParams {
    return {
      ...params,
      page: params.page ?? DEFAULT_PAGE_INDEX,
      size: params.size ?? DEFAULT_PAGE_SIZE,
      sort: params.sort ?? DEFAULT_PIPELINE_LIST_TABLE_SORT
    }
  }
})

export const getDefaultCalenderFilter = (): [Date, Date] => {
  const start = new Date()
  start.setDate(start.getDate() - 7)
  start.setHours(0, 0, 0, 0)

  const end = new Date()
  end.setHours(23, 59, 59, 999)

  return [start, end]
}

export const STATUS_OPTIONS: SelectOption[] = [
  { label: 'Enabled', value: 'Enabled' },
  { label: 'Disabled', value: 'Disabled' }
]
