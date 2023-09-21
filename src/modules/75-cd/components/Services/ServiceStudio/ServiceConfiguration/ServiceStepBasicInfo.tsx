/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback } from 'react'
import { Card, Formik, FormikForm } from '@harness/uicore'
import { debounce, isEmpty, noop } from 'lodash-es'
import * as Yup from 'yup'
import { NameIdDescriptionTags } from '@common/components'
import { NameSchema } from '@common/utils/Validation'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { NGServiceV2InfoConfig } from 'services/cd-ng'
import { GitSyncForm } from '@gitsync/components/GitSyncForm/GitSyncForm'
import { useServiceContext } from '@cd/context/ServiceContext'
import { useStrings } from 'framework/strings'
import { StoreType } from '@common/constants/GitSyncTypes'
import css from './ServiceConfiguration.module.scss'

function ServiceStepBasicInfo(): React.ReactElement {
  const { getString } = useStrings()

  const {
    state: { pipeline, storeMetadata, gitDetails },
    isReadonly,
    updatePipeline
  } = usePipelineContext()

  const { isServiceCreateModalView } = useServiceContext()
  const initialGitFormValue = {
    connectorRef: storeMetadata?.connectorRef,
    repoName: gitDetails?.repoName,
    filePath: gitDetails?.filePath
  }
  const onUpdate = useCallback(
    (value: NGServiceV2InfoConfig): void => {
      updatePipeline({ ...value })
    },
    [pipeline]
  )
  const delayedOnUpdate = React.useRef(debounce(onUpdate || noop, 1000)).current

  return (
    <div className={css.serviceStepBasicInfo}>
      <Formik
        enableReinitialize
        initialValues={{ ...pipeline, ...initialGitFormValue }}
        validate={values => {
          if (isEmpty(values.name)) {
            return
          }
          delayedOnUpdate(values)
        }}
        validationSchema={Yup.object().shape({
          name: NameSchema(getString)
        })}
        formName="service-entity"
        onSubmit={noop}
      >
        {formikProps => (
          <FormikForm>
            <div className={css.tabHeading} id="serviceBasicInfo">
              {getString('cd.pipelineSteps.serviceTab.aboutYourService')}
            </div>
            <Card className={css.sectionCard}>
              <NameIdDescriptionTags
                className={css.nameIdDescriptionTags}
                formikProps={formikProps}
                identifierProps={{
                  isIdentifierEditable: isServiceCreateModalView,
                  inputGroupProps: {
                    disabled: isReadonly
                  }
                }}
                descriptionProps={{ disabled: isReadonly }}
                tagsProps={{ disabled: isReadonly }}
              />
              {storeMetadata?.storeType === StoreType.REMOTE ? (
                <GitSyncForm
                  formikProps={formikProps}
                  isEdit={true}
                  skipBranch
                  disableFields={{
                    connectorRef: true,
                    repoName: true,
                    filePath: false
                  }}
                  initialValues={initialGitFormValue}
                />
              ) : null}
            </Card>
          </FormikForm>
        )}
      </Formik>
    </div>
  )
}

export default ServiceStepBasicInfo
