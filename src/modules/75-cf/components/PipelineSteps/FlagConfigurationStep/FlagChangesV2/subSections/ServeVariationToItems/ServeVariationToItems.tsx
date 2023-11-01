/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, useEffect } from 'react'
import { useFormikContext } from 'formik'
import type { SelectOption } from '@harness/uicore'
import { CFPipelineInstructionType } from '@cf/components/PipelineSteps/FlagConfigurationStep/types'
import SubSection from '../../SubSection'
import type { SubSectionComponentProps } from '../../subSection.types'
import { withPrefix } from '../../utils/withPrefix'
import VariationField from './VariationField'
import ItemsField from './ItemsField'

export interface ServeVariationToItemsProps extends SubSectionComponentProps {
  prefixPath: string
  instructionType:
    | CFPipelineInstructionType.ADD_TARGETS_TO_VARIATION_TARGET_MAP
    | CFPipelineInstructionType.ADD_SEGMENT_TO_VARIATION_TARGET_MAP
  displayVariationField: boolean
  displayItemsField: boolean
  items: SelectOption[]
  onQueryChange: (query: string) => void
  fetchItems: () => void
}

const ServeVariationToItems: FC<ServeVariationToItemsProps> = ({
  prefixPath,
  instructionType,
  displayVariationField,
  displayItemsField,
  items,
  onQueryChange,
  fetchItems,
  ...props
}) => {
  const { setFieldValue } = useFormikContext()

  useEffect(() => {
    setFieldValue(withPrefix(prefixPath, 'identifier'), `${instructionType}Identifier`)
    setFieldValue(withPrefix(prefixPath, 'type'), instructionType)
  }, [instructionType, prefixPath, setFieldValue])

  const isTargets = instructionType === CFPipelineInstructionType.ADD_TARGETS_TO_VARIATION_TARGET_MAP

  return (
    <SubSection data-testid={`flagChanges-serveVariationTo${isTargets ? 'Targets' : 'TargetGroups'}`} {...props}>
      {displayVariationField && <VariationField prefixPath={prefixPath} />}
      {displayItemsField && (
        <ItemsField
          prefixPath={prefixPath}
          items={items}
          onQueryChange={onQueryChange}
          fetchItems={fetchItems}
          itemType={isTargets ? 'targets' : 'segments'}
        />
      )}
    </SubSection>
  )
}

export default ServeVariationToItems
