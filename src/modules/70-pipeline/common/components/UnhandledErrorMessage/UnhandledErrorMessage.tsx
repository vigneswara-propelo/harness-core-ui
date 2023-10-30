import React from 'react'
import { Button, ButtonVariation, Container, Layout, Text } from '@harness/uicore'
import { String } from 'framework/strings'
export interface UnhandledErrorMessageProps {
  error?: Error
  onClick: () => void
}

export function UnhandledErrorMessage({ error, onClick }: UnhandledErrorMessageProps): React.ReactElement | null {
  if (!error) {
    return null
  }

  return (
    <Layout.Vertical spacing="medium" padding="large">
      <Text>
        <String stringID="errorTitle" />
      </Text>
      <Text>
        <String stringID="errorSubtitle" />
      </Text>
      <Layout.Horizontal style={{ alignItems: 'baseline' }}>
        <Text>
          <String stringID="please" />
        </Text>
        <Button variation={ButtonVariation.SECONDARY} onClick={onClick} minimal>
          <String stringID="clickHere" />
        </Button>
        <Text>
          <String stringID="errorHelp" />
        </Text>
      </Layout.Horizontal>
      {__DEV__ && (
        <React.Fragment>
          <Text font="small">Error Message</Text>
          <Container>
            <details>
              <summary>Stacktrace</summary>
              <pre>{error.stack}</pre>
            </details>
          </Container>
        </React.Fragment>
      )}
    </Layout.Vertical>
  )
}
