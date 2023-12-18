import React from 'react'
import { Color } from '@harness/design-system'
import { MultiTypeInputType, Text, SelectOption, Container } from '@harness/uicore'
import { connect, FormikContextType } from 'formik'
import { MultiTypeSelectField } from '@common/components/MultiTypeSelect/MultiTypeSelect'

import { useStrings } from 'framework/strings'

export enum ProviderTrafficShift {
  SMI = 'SMI',
  ISTIO = 'Istio'
}

interface ProviderValues {
  provider: string
}

interface ProviderSelectFieldProps {
  name: string
  formik?: FormikContextType<ProviderValues>
  isReadonly?: boolean
  path?: string
}

function ProviderSelectField(props: ProviderSelectFieldProps): React.ReactElement {
  const { name, isReadonly = false } = props

  const providerItems: SelectOption[] = [
    {
      label: ProviderTrafficShift.SMI,
      value: ProviderTrafficShift.SMI
    },
    {
      label: ProviderTrafficShift.ISTIO,
      value: ProviderTrafficShift.ISTIO
    }
  ]

  const { getString } = useStrings()

  return (
    <Container margin={{ bottom: 'medium' }}>
      <MultiTypeSelectField
        label={
          <Text color={Color.GREY_600} font={{ size: 'small', weight: 'semi-bold' }} margin={{ bottom: 'xsmall' }}>
            {getString('common.selectProvider')}
          </Text>
        }
        name={name}
        useValue
        data-testid="provider-select"
        enableConfigureOptions={false}
        multiTypeInputProps={{
          selectItems: providerItems,
          placeholder: getString('select'),
          multiTypeInputProps: {
            allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]
          }
        }}
        disabled={isReadonly}
      />
    </Container>
  )
}

export default connect(ProviderSelectField)
