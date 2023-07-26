/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, ButtonVariation, Button } from '@harness/uicore'
import { useFormikContext } from 'formik'
import { useStrings } from 'framework/strings'
interface FooterProps {
  handleBack: () => void
}
function Footer(props: FooterProps): JSX.Element {
  const formik = useFormikContext()
  const { getString } = useStrings()
  return (
    <Layout.Horizontal spacing="small">
      <Button
        variation={ButtonVariation.SECONDARY}
        text={getString('back')}
        onClick={props.handleBack}
        icon="chevron-left"
      />

      <Button
        text={getString('platform.authSettings.billing.next')}
        variation={ButtonVariation.PRIMARY}
        onClick={() => formik.handleSubmit()}
        rightIcon="chevron-right"
      />
    </Layout.Horizontal>
  )
}

export default Footer
