import React from 'react'
import { Icon, Layout, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { getHTMLFromMarkdown } from '@common/utils/MarkdownUtils'
import { useStrings } from 'framework/strings'
import css from './SubmitTicketModalSteps.module.scss'

interface SuggestionsPanelProps {
  data: any
  loading?: boolean
}

const SuggestionsCard = (suggestionItem: any): JSX.Element => {
  const { suggestionItem: suggestionItemValue } = suggestionItem
  return (
    <Layout.Vertical padding={{ bottom: 'medium' }}>
      <a href={suggestionItemValue.clickUri}>
        <li>{suggestionItemValue.title}</li>
      </a>
      <Text>{suggestionItemValue.excerpt}</Text>
    </Layout.Vertical>
  )
}

const SuggestionsPanel = (props: SuggestionsPanelProps): JSX.Element => {
  const { data } = props
  const { getString } = useStrings()

  return (
    <div className={css.suggestionsPanel}>
      <h3> {getString('common.resourceCenter.ticketmenu.suggestionsPanel')}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr' }}>
        {data.map((result: any) => (
          <SuggestionsCard suggestionItem={result} key={result.uri} />
        ))}
      </div>
    </div>
  )
}

export const AidaResponsePanel = (props: SuggestionsPanelProps): JSX.Element => {
  const { data, loading } = props
  const { getString } = useStrings()
  return (
    <div className={css.suggestionsPanel}>
      <div>
        {loading ? (
          <Layout.Horizontal margin={{ top: 'xlarge', bottom: 'xlarge' }}>
            <Icon name="harness-copilot" size={32} margin={{ right: 'small' }} />
            <Text font={{ variation: FontVariation.H4 }}>{getString('common.resourceCenter.aida.generating')}</Text>
          </Layout.Horizontal>
        ) : (
          <>
            <Layout.Horizontal margin={{ top: 'xlarge', bottom: 'xlarge' }}>
              <Icon name="harness-copilot" size={32} margin={{ right: 'small' }} />
              <Text font={{ variation: FontVariation.H4 }}>
                {getString('common.resourceCenter.aida.displayedResults')}
              </Text>
            </Layout.Horizontal>
            <p className={css.aidaResponse} dangerouslySetInnerHTML={{ __html: getHTMLFromMarkdown(data) }} />
          </>
        )}
      </div>
    </div>
  )
}

export default SuggestionsPanel
