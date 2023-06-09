import React, { FC } from 'react'
import { Button, ButtonVariation, Layout } from '@harness/uicore'
import { Intent } from '@harness/design-system'
import { useStrings } from 'framework/strings'

export interface ArchiveFlagButtonsProps {
  identifierMatch: boolean
  onArchive: () => void
  onClose: () => void
}

const ArchiveFlagButtons: FC<ArchiveFlagButtonsProps> = ({ onArchive, identifierMatch, onClose }) => {
  const { getString } = useStrings()

  return (
    <Layout.Horizontal spacing="small" flex={{ alignItems: 'flex-start' }}>
      <Button
        variation={ButtonVariation.PRIMARY}
        disabled={!identifierMatch}
        text={getString('archive')}
        intent={Intent.DANGER}
        onClick={onArchive}
      />
      <Button text={getString('cancel')} variation={ButtonVariation.TERTIARY} onClick={onClose} />
    </Layout.Horizontal>
  )
}

export default ArchiveFlagButtons
