import { useToaster } from '@harness/uicore'
import { useStrings } from 'framework/strings'

export function useCopyToClipboard(): { copyToClipboard: (text: string) => void } {
  const { showSuccess, showError } = useToaster()
  const { getString } = useStrings()

  const copyToClipboard = async (source: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(source)
      showSuccess(getString('clipboardCopySuccess'))
    } catch (ex) {
      showError(getString('clipboardCopyFail'))
    }
  }

  return { copyToClipboard }
}
