import React, { useEffect, useState } from 'react'
import { get, isEmpty, isEqual } from 'lodash-es'
import { useFormikContext } from 'formik'
import { useParams } from 'react-router-dom'

import { FormInput, SelectOption, shouldShowError, useToaster } from '@harness/uicore'
import { useStrings } from 'framework/strings'

import { InfrastructureResponse, useGetInfrastructureList } from 'services/cd-ng'

import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getScopeFromValue } from '@common/components/EntityReference/EntityReference'
import { Scope } from '@common/interfaces/SecretsInterface'
import { getIdentifierFromScopedRef } from '@common/utils/utils'

import type { ServiceOverrideRowFormState } from '@cd/components/ServiceOverrides/ServiceOverridesUtils'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'

export default function InfrastructureSelect({ readonly }: { readonly?: boolean }): React.ReactElement {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const [infraOptions, setInfraOptions] = useState<SelectOption[]>([])
  const { values } = useFormikContext<ServiceOverrideRowFormState>()
  const { getRBACErrorMessage } = useRBACError()
  const { showError } = useToaster()
  const { getString } = useStrings()

  const envScope = getScopeFromValue(values.environmentRef as string)

  const {
    data: infrastructuresListResponse,
    error: listError,
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
    const _infraOptions = get(infrastructuresListResponse, 'data.content', []).map(
      (infraInList: InfrastructureResponse) => ({
        label: infraInList.infrastructure?.name as string,
        value: infraInList.infrastructure?.identifier as string
      })
    )
    if (!loadingInfrastructuresList && !isEmpty(_infraOptions) && !isEqual(_infraOptions, infraOptions)) {
      setInfraOptions(_infraOptions)
    }
  }, [loadingInfrastructuresList, infrastructuresListResponse])

  useEffect(() => {
    /* istanbul ignore else */
    if (listError?.message) {
      /* istanbul ignore else */
      if (shouldShowError(listError)) {
        showError(getRBACErrorMessage(listError))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listError])

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
