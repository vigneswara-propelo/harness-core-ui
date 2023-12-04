/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC } from 'react'
import { Container, Heading, Layout } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import FlagChangesForm from './FlagChangesForm'
import css from './FlagChanges.module.scss'

export interface FlagChangesRuntimeProps {
  pathPrefix?: string
}

const FlagChangesRuntime: FC<FlagChangesRuntimeProps> = ({ pathPrefix = '' }) => {
  const { getString } = useStrings()

  return (
    <Layout.Vertical spacing="medium">
      <Heading level={5} font={{ variation: FontVariation.H5 }}>
        {getString('cf.pipeline.flagConfiguration.flagChanges')}
      </Heading>

      <Container className={css.formWrapper}>
        <FlagChangesForm prefixPath={pathPrefix} />
      </Container>
    </Layout.Vertical>
  )
}

export default FlagChangesRuntime
