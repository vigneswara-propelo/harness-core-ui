/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { FormikForm, Layout, ThumbnailSelect, ButtonVariation, Label, Button, Text } from '@harness/uicore'
import cx from 'classnames'
import { FontVariation } from '@harness/design-system'
import { Classes, Divider } from '@blueprintjs/core'
import { FormikProps } from 'formik'
import { defaultTo } from 'lodash-es'
import { NameIdDescriptionTags } from '@modules/10-common/components'
import { useStrings } from 'framework/strings'
import { useTelemetry } from '@modules/10-common/hooks/useTelemetry'
import { Category, ExitModalActions } from '@modules/10-common/constants/TrackingConstants'
import { EnvironmentResponseDTO } from 'services/cd-ng'
import { InlineRemoteSelect } from '@modules/10-common/components/InlineRemoteSelect/InlineRemoteSelect'
import { StoreType } from '@modules/10-common/constants/GitSyncTypes'
import { GitSyncForm, GitSyncFormFields } from '@modules/40-gitsync/components/GitSyncForm/GitSyncForm'
import css from './DeployEnvStep.module.scss'

interface NewEnvironmentFormProps {
  formikProps: FormikProps<EnvironmentResponseDTO & GitSyncFormFields>
  isEdit: boolean
  isGitXEnabledForEnvironments: boolean
  closeModal?: () => void
}

export function NewEnvironmentForm(props: NewEnvironmentFormProps): JSX.Element {
  const { formikProps, isEdit, closeModal, isGitXEnabledForEnvironments } = props
  const { getString } = useStrings()
  const { trackEvent } = useTelemetry()
  const typeList: { label: string; value: string }[] = [
    {
      label: getString('production'),
      value: 'Production'
    },
    {
      label: getString('cd.preProduction'),
      value: 'PreProduction'
    }
  ]
  return (
    <FormikForm className={css.envForm}>
      <NameIdDescriptionTags
        formikProps={formikProps}
        className={css.nameIdDescriptionTags}
        identifierProps={{
          inputLabel: getString('name'),
          inputGroupProps: {
            inputGroup: {
              autoFocus: true
            }
          },
          isIdentifierEditable: !isEdit
        }}
      />
      <Layout.Vertical spacing={'small'} margin={{ bottom: 'medium' }}>
        <Label className={cx(Classes.LABEL, css.label)}>{getString('envType')}</Label>
        <ThumbnailSelect className={css.thumbnailSelect} name={'type'} items={typeList} />
      </Layout.Vertical>
      {isGitXEnabledForEnvironments ? (
        <>
          <Divider />
          <Text font={{ variation: FontVariation.FORM_SUB_SECTION }} margin={{ top: 'medium', bottom: 'medium' }}>
            {getString('cd.chooseEnvironmentSetupHeader')}
          </Text>
          <InlineRemoteSelect
            className={css.envCardWrapper}
            entityType={'Environment'}
            selected={defaultTo(formikProps?.values?.storeType, StoreType.INLINE)}
            getCardDisabledStatus={(current, selected) => {
              return isEdit ? current !== selected : false
            }}
            onChange={item => {
              if (!isEdit) {
                formikProps?.setFieldValue('storeType', item.type)
              }
            }}
          />
        </>
      ) : null}

      {formikProps?.values?.storeType === StoreType.REMOTE ? (
        <GitSyncForm formikProps={formikProps} isEdit={isEdit} />
      ) : null}
      <Layout.Horizontal spacing="small" padding={{ top: 'xlarge' }}>
        <Button
          variation={ButtonVariation.PRIMARY}
          type={'submit'}
          text={getString('save')}
          data-id="environment-save"
        />
        <Button
          variation={ButtonVariation.TERTIARY}
          text={getString('cancel')}
          onClick={() => {
            !isEdit &&
              trackEvent(ExitModalActions.ExitByCancel, {
                category: Category.ENVIRONMENT
              })
            closeModal?.()
          }}
        />
      </Layout.Horizontal>
    </FormikForm>
  )
}
