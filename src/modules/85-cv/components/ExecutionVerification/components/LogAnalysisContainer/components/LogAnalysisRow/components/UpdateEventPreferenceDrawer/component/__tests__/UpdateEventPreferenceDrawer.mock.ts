import { LogEvents } from '@cv/components/ExecutionVerification/components/LogAnalysisContainer/LogAnalysis.types'
import type { UpdateEventPreferenceDrawerProps } from '../../UpdateEventPreferenceDrawer'

export const updateEventRowData: UpdateEventPreferenceDrawerProps['rowData'] = {
  clusterType: LogEvents.NO_BASELINE_AVAILABLE,
  count: 10,
  message: 'Some message',
  messageFrequency: [],
  riskStatus: 'HEALTHY'
}

export const feedbackHistoryResponse = [
  {
    updatedBy: 'pranesh.g@harness.io',
    logFeedback: {
      feedbackScore: 'NO_RISK_CONSIDER_FREQUENCY',
      description: 'It is not an issue',
      updatedAt: 1677414840933
    }
  }
]
