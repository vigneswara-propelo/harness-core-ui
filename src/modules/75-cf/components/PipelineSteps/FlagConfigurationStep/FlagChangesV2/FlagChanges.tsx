/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, useEffect, useState } from 'react'
import { get } from 'lodash-es'
import { useFormikContext } from 'formik'
import { Container, Heading, Layout, MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { String, useStrings } from 'framework/strings'
import { isMultiTypeFixed, isMultiTypeRuntime } from '@common/utils/utils'
import MultiTypeSelectorButton from '@common/components/MultiTypeSelectorButton/MultiTypeSelectorButton'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useFlagChanges } from '../FlagChangesContextProvider'
import { withPrefix } from './utils/withPrefix'
import FlagChangesForm from './FlagChangesForm'
import css from './FlagChanges.module.scss'
import subSectionCSS from './SubSection.module.scss'

export interface FlagChangesProps {
  pathPrefix?: string
}

const FlagChanges: FC<FlagChangesProps> = ({ pathPrefix = '' }) => {
  const { getString } = useStrings()
  const { setFieldValue, values } = useFormikContext()
  const { mode, initialInstructions } = useFlagChanges()

  const [inputType, setInputType] = useState<MultiTypeInputType>(
    initialInstructions === RUNTIME_INPUT_VALUE ? MultiTypeInputType.RUNTIME : MultiTypeInputType.FIXED
  )

  const fieldPath = withPrefix(pathPrefix, 'spec.instructions')

  useEffect(() => {
    const currentValue = get(values, fieldPath)

    if (isMultiTypeRuntime(inputType) && currentValue !== RUNTIME_INPUT_VALUE) {
      setFieldValue(fieldPath, RUNTIME_INPUT_VALUE)
    } else if (isMultiTypeFixed(inputType) && currentValue === RUNTIME_INPUT_VALUE) {
      setFieldValue(fieldPath, undefined)
    }
  }, [fieldPath, inputType, setFieldValue, values])

  return (
    <Layout.Vertical spacing="medium">
      {mode === StepViewType.Edit ? (
        <Layout.Horizontal flex={{ justifyContent: 'space-between' }}>
          <Heading level={5} font={{ variation: FontVariation.H5 }}>
            {getString('cf.pipeline.flagConfiguration.flagChanges')}
          </Heading>
          <MultiTypeSelectorButton
            type={inputType}
            onChange={setInputType}
            allowedTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]}
          />
        </Layout.Horizontal>
      ) : (
        <Heading level={5} font={{ variation: FontVariation.H5 }}>
          {getString('cf.pipeline.flagConfiguration.flagChanges')}
        </Heading>
      )}

      {isMultiTypeRuntime(inputType) ? (
        <Container className={subSectionCSS.subSection} padding="large">
          <String stringID="cf.pipeline.flagConfiguration.flagChangesV2Runtime" useRichText />
        </Container>
      ) : (
        <Container className={css.formWrapper}>
          <FlagChangesForm prefixPath={pathPrefix} />
        </Container>
      )}
    </Layout.Vertical>
  )
}

export default FlagChanges
