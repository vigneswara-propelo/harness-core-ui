/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Text, Button, ButtonVariation } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import cx from 'classnames'
import { TelemetryEvent, useTelemetry } from '@common/hooks/useTelemetry'
import { useStrings } from 'framework/strings'
import CopyButton from '../utils/CopyButton'
import css from './CommandBlock.module.scss'
interface DownloadFileProps {
  downloadFileExtension?: string
  downloadFileName?: string
}

interface TelemetryProps {
  copyTelemetryProps?: TelemetryEvent
  downloadTelemetryProps?: TelemetryEvent
}
interface CommandBlockProps {
  commandSnippet: string
  allowCopy?: boolean
  ignoreWhiteSpaces?: boolean
  allowDownload?: boolean
  downloadFileProps?: DownloadFileProps
  telemetryProps?: TelemetryProps
  copySnippet?: string
  copyButtonText?: string
  darkmode?: boolean
  commentPrefix?: string
  onCopy?: () => void
}
enum DownloadFile {
  DEFAULT_NAME = 'commandBlock',
  DEFAULT_TYPE = 'txt'
}

const CommandBlock: React.FC<CommandBlockProps> = ({
  commandSnippet,
  allowCopy,
  ignoreWhiteSpaces = true,
  allowDownload = false,
  downloadFileProps,
  telemetryProps,
  copySnippet,
  copyButtonText,
  darkmode,
  commentPrefix,
  onCopy
}) => {
  const { trackEvent } = useTelemetry()
  const downloadFileDefaultName = downloadFileProps?.downloadFileName || DownloadFile.DEFAULT_NAME
  const downloadeFileDefaultExtension =
    (downloadFileProps && downloadFileProps.downloadFileExtension) || DownloadFile.DEFAULT_TYPE
  const linkRef = React.useRef<HTMLAnchorElement>(null)

  const { getString } = useStrings()
  const onDownload = (): void => {
    const content = new Blob([commandSnippet as BlobPart], { type: 'data:text/plain;charset=utf-8' })
    if (linkRef?.current) {
      linkRef.current.href = window.URL.createObjectURL(content)
      linkRef.current.download = `${downloadFileDefaultName}.${downloadeFileDefaultExtension}`
      linkRef.current.click()
    }
  }
  return commentPrefix ? (
    <CommandBlockWithComments
      darkmode={darkmode}
      allowCopy
      ignoreWhiteSpaces={false}
      commandSnippet={commandSnippet}
      downloadFileProps={{ downloadFileName: 'harness-cli-install-steps', downloadFileExtension: 'xdf' }}
      copyButtonText={getString('common.copy')}
      commentPrefix={commentPrefix}
    />
  ) : (
    <Layout.Horizontal
      flex={{ justifyContent: 'space-between', alignItems: 'start' }}
      className={cx(css.commandBlock, { [css.darkmode]: darkmode })}
    >
      <Text
        color={darkmode ? Color.WHITE : undefined}
        className={cx(!ignoreWhiteSpaces && css.ignoreWhiteSpaces)}
        font={{ variation: FontVariation.YAML }}
      >
        {commandSnippet}
      </Text>
      <Layout.Horizontal flex={{ justifyContent: 'center', alignItems: 'center' }} spacing="medium">
        {(allowCopy || copySnippet) && (
          <CopyButton
            textToCopy={copySnippet || commandSnippet}
            text={copyButtonText}
            onCopySuccess={() => {
              if (telemetryProps?.copyTelemetryProps) {
                trackEvent(
                  telemetryProps?.copyTelemetryProps?.eventName,
                  telemetryProps?.copyTelemetryProps?.properties
                )
              }
              onCopy?.()
            }}
            primaryBtn={darkmode}
            className={cx({ [css.copyButtonHover]: darkmode })}
          />
        )}
        {allowDownload && (
          <>
            <Button
              className={css.downloadBtn}
              variation={ButtonVariation.LINK}
              text={getString('common.download')}
              onClick={event => {
                event.stopPropagation()
                if (telemetryProps?.downloadTelemetryProps) {
                  trackEvent(
                    telemetryProps?.downloadTelemetryProps.eventName,
                    telemetryProps?.downloadTelemetryProps.properties
                  )
                }
                onDownload()
              }}
            />
            <a className="hide" ref={linkRef} target={'_blank'} />
          </>
        )}
      </Layout.Horizontal>
    </Layout.Horizontal>
  )
}

export default CommandBlock

const CommandBlockWithComments: React.FC<CommandBlockProps> = ({
  commandSnippet,
  allowCopy,
  ignoreWhiteSpaces = true,
  allowDownload = false,
  downloadFileProps,
  telemetryProps,
  copySnippet,
  copyButtonText,
  darkmode,
  commentPrefix = ''
}) => {
  const { trackEvent } = useTelemetry()
  const downloadFileDefaultName = downloadFileProps?.downloadFileName || DownloadFile.DEFAULT_NAME
  const downloadeFileDefaultExtension =
    (downloadFileProps && downloadFileProps.downloadFileExtension) || DownloadFile.DEFAULT_TYPE
  const linkRef = React.useRef<HTMLAnchorElement>(null)

  const { getString } = useStrings()
  const onDownload = (): void => {
    const content = new Blob([commandSnippet as BlobPart], { type: 'data:text/plain;charset=utf-8' })
    if (linkRef?.current) {
      linkRef.current.href = window.URL.createObjectURL(content)
      linkRef.current.download = `${downloadFileDefaultName}.${downloadeFileDefaultExtension}`
      linkRef.current.click()
    }
  }
  return (
    <Layout.Horizontal
      flex={{ justifyContent: 'space-between', alignItems: 'start' }}
      className={cx(css.commandBlock, { [css.darkmode]: darkmode })}
    >
      <Layout.Vertical className={css.commandText}>
        {commandSnippet.split('\n').map(str => {
          const isComment = str && str.startsWith(commentPrefix)

          return (
            <Text
              key={str}
              color={isComment ? Color.RED_300 : darkmode ? Color.WHITE : undefined}
              className={cx(!ignoreWhiteSpaces && css.ignoreWhiteSpaces)}
              font={{ variation: FontVariation.YAML }}
            >
              {str}
            </Text>
          )
        })}
      </Layout.Vertical>
      <Layout.Horizontal flex={{ justifyContent: 'center', alignItems: 'center' }} spacing="medium">
        {(allowCopy || copySnippet) && (
          <CopyButton
            textToCopy={copySnippet || commandSnippet}
            text={copyButtonText}
            onCopySuccess={() => {
              if (telemetryProps?.copyTelemetryProps) {
                trackEvent(
                  telemetryProps?.copyTelemetryProps?.eventName,
                  telemetryProps?.copyTelemetryProps?.properties
                )
              }
            }}
            primaryBtn={darkmode}
            className={cx({ [css.copyButtonHover]: darkmode })}
          />
        )}
        {allowDownload && (
          <>
            <Button
              className={css.downloadBtn}
              variation={ButtonVariation.LINK}
              text={getString('common.download')}
              onClick={event => {
                event.stopPropagation()
                if (telemetryProps?.downloadTelemetryProps) {
                  trackEvent(
                    telemetryProps?.downloadTelemetryProps.eventName,
                    telemetryProps?.downloadTelemetryProps.properties
                  )
                }
                onDownload()
              }}
            />
            <a className="hide" ref={linkRef} target={'_blank'} />
          </>
        )}
      </Layout.Horizontal>
    </Layout.Horizontal>
  )
}
