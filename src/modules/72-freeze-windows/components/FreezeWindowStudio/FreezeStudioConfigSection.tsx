/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Card, Container, Heading } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import css from '@freeze-windows/components/FreezeWindowStudio/FreezeWindowStudio.module.scss'

interface FreezeStudioConfigSectionProps {
  isReadOnly: boolean
  onBack: () => void
  onNext: () => void
}

// enum ConfigModes {
//   Add = 'Add',
//   Edit = 'Edit'
// }
//
// const ConfigView = () => {}
//
// const addConfigButton = () => {
//   return <button>Add rule</button>
// }
//
// const ConfigList = configs => {
//   return configs.map(c => <div>{c}</div>)
// }

export const FreezeStudioConfigSection: React.FC<FreezeStudioConfigSectionProps> = () => {
  const { getString } = useStrings()
  return (
    <Container padding={{ top: 'small', right: 'xxlarge', bottom: 'xxlarge', left: 'xxlarge' }}>
      <Heading color={Color.BLACK} level={3} style={{ fontWeight: 600, fontSize: '16px', lineHeight: '24px' }}>
        {getString('freezeWindows.freezeStudio.freezeConfiguration')}
      </Heading>
      <Card className={css.sectionCard}>
        <Heading color={Color.GREY_700} level={4} style={{ fontWeight: 600, fontSize: '14px', lineHeight: '24px' }}>
          {getString('freezeWindows.freezeStudio.defineResources')}
        </Heading>
      </Card>
    </Container>
  )
}
