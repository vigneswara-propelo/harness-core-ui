/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, MouseEvent, PropsWithChildren } from 'react'
import { Button, ButtonSize, ButtonVariation, Container, Heading, Layout } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import css from './SubSection.module.scss'

export interface SubSectionProps extends PropsWithChildren<unknown> {
  title: string
  onRemove?: () => void
}

const SubSection: FC<SubSectionProps> = ({ title, onRemove, children }) => {
  const { getString } = useStrings()

  return (
    <Layout.Vertical className={css.subSection} data-testid="flag-changes-subsection">
      <Layout.Horizontal border={{ bottom: true }} padding="medium" flex={{ justifyContent: 'space-between' }}>
        <Heading level={6} font={{ variation: FontVariation.FORM_SUB_SECTION }} className={css.heading}>
          {title}
        </Heading>

        {onRemove && (
          <Button
            size={ButtonSize.SMALL}
            onClick={(e: MouseEvent) => {
              e.preventDefault()
              onRemove()
            }}
            variation={ButtonVariation.ICON}
            icon="main-trash"
            aria-label={getString('cf.pipeline.flagConfiguration.removeFlagChange')}
          />
        )}
      </Layout.Horizontal>
      <Container padding="large">{children}</Container>
    </Layout.Vertical>
  )
}

export default SubSection
