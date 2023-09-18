/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, useCallback } from 'react'
import { Container, Heading, Layout, RUNTIME_INPUT_VALUE, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { useFormikContext } from 'formik'
import { useStrings } from 'framework/strings'
import type { Feature } from 'services/cf'
import type { FeatureFlagConfigurationInstruction, FlagConfigurationStepFormDataValues } from '../types'
import FlagChangesForm, { FlagChangesFormProps } from './FlagChangesForm'
import css from './FlagChanges.module.scss'
import subSectionCSS from './SubSection.module.scss'

export interface FlagChangesProps {
  selectedFeature?: Feature
  initialInstructions?: FeatureFlagConfigurationInstruction[] | typeof RUNTIME_INPUT_VALUE
  pathPrefix?: string
}

const FlagChanges: FC<FlagChangesProps> = ({ selectedFeature, initialInstructions, pathPrefix = '' }) => {
  const { values } = useFormikContext<FlagConfigurationStepFormDataValues>()
  const { getString } = useStrings()
  const prefix = useCallback<(path: string) => string>(
    path => (pathPrefix ? `${pathPrefix}.${path}` : path),
    [pathPrefix]
  )

  return (
    <Layout.Vertical spacing="medium">
      <Heading level={5} font={{ variation: FontVariation.H5 }}>
        {getString('cf.pipeline.flagConfiguration.flagChanges')}
      </Heading>

      {!values.spec.environment || !values.spec.feature ? (
        <Container className={subSectionCSS.subSection} padding="large" data-testid="flag-changes-no-flag-selected">
          <Text>{getString('cf.pipeline.flagConfiguration.pleaseSelectAFeatureFlag')}</Text>
        </Container>
      ) : (
        <Container className={css.formWrapper}>
          <FlagChangesForm
            prefix={prefix}
            initialInstructions={initialInstructions as FlagChangesFormProps['initialInstructions']}
            selectedFeature={selectedFeature}
          />
        </Container>
      )}
    </Layout.Vertical>
  )
}

export default FlagChanges
