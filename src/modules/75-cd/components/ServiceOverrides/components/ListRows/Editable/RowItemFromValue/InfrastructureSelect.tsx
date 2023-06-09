import React, { useEffect, useState } from 'react'
import { isEmpty } from 'lodash-es'
import { useFormikContext } from 'formik'
import { useParams } from 'react-router-dom'

import { FormInput, SelectOption } from '@harness/uicore'
import { useStrings } from 'framework/strings'

import { useGetInfrastructureList } from 'services/cd-ng'

import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getScopeFromValue } from '@common/components/EntityReference/EntityReference'
import { Scope } from '@common/interfaces/SecretsInterface'
import { getIdentifierFromScopedRef } from '@common/utils/utils'

import type { ServiceOverrideRowFormState } from '@cd/components/ServiceOverrides/ServiceOverridesUtils'

export default function InfrastructureSelect({ readonly }: { readonly?: boolean }): React.ReactElement {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const [infraOptions, setInfraOptions] = useState<SelectOption[]>([])
  const { values } = useFormikContext<ServiceOverrideRowFormState>()
  const { getString } = useStrings()

  const envScope = getScopeFromValue(values.environmentRef as string)

  const {
    data: infrastructuresListResponse,
    loading: loadingInfrastructuresList,
    refetch: refetchInfrastructuresList
  } = useGetInfrastructureList({
    lazy: true
  })

  useEffect(() => {
    if (values.environmentRef) {
      refetchInfrastructuresList({
        queryParams: {
          accountIdentifier: accountId,
          ...((envScope === Scope.PROJECT || envScope === Scope.ORG) && { orgIdentifier }),
          ...(envScope === Scope.PROJECT && { projectIdentifier }),
          environmentIdentifier: getIdentifierFromScopedRef(values.environmentRef as string)
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.environmentRef, accountId, orgIdentifier, projectIdentifier, envScope])

  useEffect(() => {
    const infraList = infrastructuresListResponse?.data?.content
    if (!loadingInfrastructuresList && infraList) {
      setInfraOptions(
        !isEmpty(infraList)
          ? infraList.map(infraInList => ({
              label: infraInList.infrastructure?.name as string,
              value: infraInList.infrastructure?.identifier as string
            }))
          : []
      )
    }
  }, [loadingInfrastructuresList, infrastructuresListResponse])

  return (
    <FormInput.Select
      name="infraIdentifier"
      label={''}
      placeholder={getString('select')}
      items={infraOptions}
      disabled={loadingInfrastructuresList || readonly}
    />
  )
}
