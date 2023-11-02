import React, { ReactNode } from 'react'
import { Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import CommandBlock from '@modules/10-common/CommandBlock/CommandBlock'
import css from '../../CDOnboardingWizardWithCLI.module.scss'
export default function CommandRow({
  commandSnippet,
  title,
  children,
  classname
}: {
  children?: ReactNode
  classname?: string
  commandSnippet: string
  title: string | ReactNode
}): JSX.Element {
  const { getString } = useStrings()
  return (
    <div className={classname}>
      <Text color={Color.BLACK}>{title}</Text>
      {children}
      <div className={css.commandBlock}>
        <CommandBlock
          allowCopy
          ignoreWhiteSpaces={false}
          commandSnippet={commandSnippet}
          downloadFileProps={{ downloadFileName: 'harness-cli-clone-codebase', downloadFileExtension: 'xdf' }}
          copyButtonText={getString('common.copy')}
        />
      </div>
    </div>
  )
}
