/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { FormikForm, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { Divider } from '@blueprintjs/core'
import { FormikProps } from 'formik'
import { defaultTo } from 'lodash-es'
import { NameIdDescriptionTags } from '@modules/10-common/components'
import { useStrings } from 'framework/strings'
import { InlineRemoteSelect } from '@modules/10-common/components/InlineRemoteSelect/InlineRemoteSelect'
import { GitSyncForm, GitSyncFormFields } from '@modules/40-gitsync/components/GitSyncForm/GitSyncForm'

import { CombinedInfrastructureDefinationResponse } from './BootstrapDeployInfraDefinition'
import css from './InfrastructureDefinition.module.scss'

interface NewInfrastructureFormProps {
  formikProps: FormikProps<Partial<CombinedInfrastructureDefinationResponse> & GitSyncFormFields>
  isGitXEnabledForInfras: boolean
  isEdit: boolean
  isReadOnly: boolean
  infrastructureDefinition?: CombinedInfrastructureDefinationResponse
  initialValues?: Partial<CombinedInfrastructureDefinationResponse> & GitSyncFormFields
}

export function NewInfrastructureForm(props: NewInfrastructureFormProps): JSX.Element {
  const { formikProps, isGitXEnabledForInfras, isEdit, isReadOnly, infrastructureDefinition, initialValues } = props
  const { getString } = useStrings()
  const { values, setFieldValue } = formikProps
  return (
    <FormikForm className={css.infraForm}>
      <NameIdDescriptionTags
        formikProps={formikProps}
        identifierProps={{
          isIdentifierEditable: isReadOnly ? false : !infrastructureDefinition
        }}
        descriptionProps={{
          disabled: isReadOnly
        }}
        inputGroupProps={{
          disabled: isReadOnly
        }}
        tagsProps={{
          disabled: isReadOnly
        }}
      />
      {isGitXEnabledForInfras ? (
        <>
          <Divider />
          <Text font={{ variation: FontVariation.FORM_SUB_SECTION }} margin={{ top: 'medium', bottom: 'medium' }}>
            {getString('cd.infrastructure.chooseInfrastructureSetupHeader')}
          </Text>
          <InlineRemoteSelect
            className={css.infraCardWrapper}
            entityType={'Infrastructure'}
            selected={defaultTo(values?.storeType, 'INLINE')}
            getCardDisabledStatus={(current, selected) => {
              return isEdit ? current !== selected : false
            }}
            onChange={item => {
              if (!isEdit) {
                setFieldValue('storeType', item.type)
              }
            }}
          />
        </>
      ) : null}
      {values?.storeType === 'REMOTE' ? (
        <GitSyncForm
          formikProps={formikProps}
          isEdit={isEdit}
          skipBranch={isEdit}
          disableFields={{
            provider: isEdit,
            connectorRef: isEdit,
            repoName: isEdit,
            filePath: isEdit
          }}
          initialValues={initialValues}
        />
      ) : null}
    </FormikForm>
  )
}
