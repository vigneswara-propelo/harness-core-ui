import { SelectOption } from '@harness/uicore'
import { UseStringsReturn } from 'framework/strings'

export function getInitialValue(selectedValue?: SelectOption | string): SelectOption | null {
  if (!selectedValue) {
    return null
  }

  if (typeof selectedValue === 'string') {
    return {
      label: selectedValue,
      value: selectedValue
    }
  }

  return selectedValue
}

export function getDisplayName({
  selectedOption,
  applicationLoading,
  getString
}: {
  selectedOption: SelectOption | null
  applicationLoading: boolean
  getString: UseStringsReturn['getString']
}): string {
  if (applicationLoading) {
    return getString('loading')
  }

  const selectedValue = selectedOption?.value || null

  if (selectedValue) {
    return (selectedOption as SelectOption)?.value as string
  }

  return getString('cv.monitoringSources.newRelic.selectApplication')
}
