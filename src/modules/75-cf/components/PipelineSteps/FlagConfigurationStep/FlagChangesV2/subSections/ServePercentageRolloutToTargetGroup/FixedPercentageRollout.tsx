/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, useEffect, useMemo, useRef } from 'react'
import { get } from 'lodash-es'
import { useFormikContext } from 'formik'
import { FormGroup } from '@blueprintjs/core'
import { AllowedTypes, Layout, MultiTypeInputType } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import MultiTypeSelectorButton from '@common/components/MultiTypeSelectorButton/MultiTypeSelectorButton'
import PercentageRollout from '@cf/components/PercentageRollout/PercentageRollout'
import usePercentageRolloutEqualiser from '@cf/hooks/usePercentageRolloutEqualiser'
import { withPrefix } from '../../utils/withPrefix'
import { useFlagChanges } from '../../../FlagChangesContextProvider'

export interface FixedPercentageRolloutProps {
  prefixPath: string
  onTypeChange: (newType: string) => void
  allowableTypes: MultiTypeInputType[]
}

const FixedPercentageRollout: FC<FixedPercentageRolloutProps> = ({ prefixPath, onTypeChange, allowableTypes }) => {
  const { getString } = useStrings()
  const { values, setFieldValue } = useFormikContext()
  const { flag, readonly } = useFlagChanges()
  const initialLoad = useRef<boolean>(
    !!get(values, withPrefix(prefixPath, 'spec.distribution.variations[0].variation'))
  )

  useEffect(() => {
    if (typeof flag === 'object') {
      if (!initialLoad.current) {
        setFieldValue(withPrefix(prefixPath, 'spec.distribution.variations'), undefined)
      }

      flag.variations.forEach(({ identifier }, index) => {
        setFieldValue(withPrefix(prefixPath, `spec.distribution.variations[${index}].variation`), identifier)

        if (!initialLoad.current) {
          setFieldValue(
            withPrefix(prefixPath, `spec.distribution.variations[${index}].weight`),
            Math.floor(100 / flag.variations?.length || 1)
          )
        }
      })

      initialLoad.current = false
    }
  }, [flag, prefixPath, setFieldValue])

  const variationWeightIds = useMemo<string[]>(
    () =>
      (typeof flag === 'object' ? flag.variations : []).map((_, index) =>
        withPrefix(prefixPath, `spec.distribution.variations[${index}].weight`)
      ),
    [flag, prefixPath]
  )

  usePercentageRolloutEqualiser(variationWeightIds)

  return (
    <FormGroup label={getString('cf.featureFlags.percentageRollout')} disabled={readonly}>
      <Layout.Horizontal spacing="xsmall" flex={{ alignItems: 'flex-start' }}>
        <PercentageRollout
          hideBucketBy
          variations={typeof flag === 'object' ? flag.variations : []}
          fieldValues={get(values, withPrefix(prefixPath, 'spec.distribution'))}
          prefix={(fieldName: string) => withPrefix(prefixPath, `spec.distribution.${fieldName}`)}
          style={{ flex: 1 }}
        />

        <MultiTypeSelectorButton
          type={MultiTypeInputType.FIXED}
          onChange={onTypeChange}
          allowedTypes={allowableTypes as AllowedTypes}
          disabled={readonly}
        />
      </Layout.Horizontal>
    </FormGroup>
  )
}

export default FixedPercentageRollout
