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
import { subSectionNames } from './subSection.types'
import subSectionCSS from './SubSection.module.scss'

export interface SubSectionsProps {
  prefix: (fieldName: string) => string
  subSections: SubSectionComponent[]
  onRemove: (subSection: SubSectionComponent) => void
}

const SubSections: FC<SubSectionsProps> = ({ prefix, subSections, onRemove }) => {
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
          title={getString(subSectionNames[SubSection.name])}
          prefix={fieldName => prefix(`spec.instructions[${index}].${fieldName}`)}
          onRemove={() => onRemove(SubSection)}
        />
      ))}
    </>
  )
}

export default SubSections
