export enum EvaluationStatus {
  ERROR = 'error',
  PASS = 'pass',
  WARNING = 'warning'
}

export interface IacmFormattedData {
  policySetId?: string
  policySetName?: string
  status?: string
  identifier?: string
  created?: string | number
  accountId?: string
  orgId?: string
  projectId?: string
  description?: string
  policyMetadata: {
    id?: string | number
    policyId?: string
    policyName?: string
    severity?: string
    denyMessages?: string[]
    status?: string
    identifier?: string | number
    accountId?: string
    orgId?: string
    projectId?: string
    created?: string | number
    updated?: string | number
    error?: string
  }[]
}
