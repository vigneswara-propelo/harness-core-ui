import { SelectOption } from '@harness/uicore'

export function getCommonHealthSourceDropdownValue(listOptions: SelectOption[], fieldValue: string): SelectOption {
  const dropdownField = listOptions.find(el => el.value === fieldValue)
  return dropdownField ? dropdownField : { label: fieldValue, value: fieldValue }
}
