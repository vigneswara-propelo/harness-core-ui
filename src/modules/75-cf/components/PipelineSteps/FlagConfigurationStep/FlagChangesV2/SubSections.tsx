/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC } from 'react'
import { Container } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { SubSectionComponent } from './subSection.types'
import { withPrefix } from './utils/withPrefix'
import subSectionCSS from './SubSection.module.scss'

export interface SubSectionsProps {
  prefixPath: string
  subSections: SubSectionComponent[]
  onRemove?: (subSection: SubSectionComponent) => void
}

const SubSections: FC<SubSectionsProps> = ({ prefixPath, subSections, onRemove }) => {
  const { getString } = useStrings()

  return (
    <>
      {!subSections.length && (
        <Container className={subSectionCSS.subSection} padding="large">
          {getString('cf.pipeline.flagConfiguration.noFlagChanges')}
        </Container>
      )}

      {subSections.map((SubSection, index) => (
        <SubSection
          key={SubSection.name}
          title={getString(SubSection.stringIdentifier)}
          prefixPath={withPrefix(prefixPath, `spec.instructions[${index}]`)}
          onRemove={onRemove ? () => onRemove(SubSection) : undefined}
        />
      ))}
    </>
  )
}

export default SubSections
