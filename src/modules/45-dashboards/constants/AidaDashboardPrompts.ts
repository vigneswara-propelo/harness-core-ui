import { Prompt } from 'services/custom-dashboards'

const CloudCostPrompt: Prompt = {
  title: 'Cloud Cost Management',
  options: [
    {
      content: 'AWS',
      mapping: [
        { key: 'model', value: 'CE' },
        { key: 'explore', value: 'aws' }
      ],
      mapped_content: 'AWS costs'
    },
    {
      content: 'Azure',
      mapping: [
        { key: 'model', value: 'CE' },
        { key: 'explore', value: 'azure' }
      ],
      mapped_content: 'Azure costs'
    },
    {
      content: 'GCP',
      mapping: [
        { key: 'model', value: 'CE' },
        { key: 'explore', value: 'gcp' }
      ],
      mapped_content: 'GCP costs'
    },
    {
      content: 'Kubernetes Cluster',
      mapping: [
        { key: 'model', value: 'CE' },
        { key: 'explore', value: 'cluster' }
      ],
      mapped_content: 'Kubernetes cluster costs'
    }
  ]
}

const ContinuousBuildsPrompt: Prompt = {
  title: 'Continuous Builds',
  options: [
    {
      content: 'Builds and Repositories',
      mapping: [
        { key: 'model', value: 'CI' },
        { key: 'explore', value: 'pipeline_execution_summary_ci' }
      ]
    }
  ]
}

const ContinuousErrorTrackingPrompt: Prompt = {
  title: 'Continuous Error Tracking',
  options: [
    {
      content: 'Dashboard Invocation Daily Agg',
      mapping: [
        { key: 'model', value: 'CET' },
        { key: 'explore', value: 'dashboard_invocation_daily_agg' }
      ],
      mapped_content: 'the daily aggregate of dashboard invocations'
    }
  ]
}

const ContinuousVerificationPrompt: Prompt = {
  title: 'Continuous Verification',
  options: [
    {
      content: 'Deployment Stages',
      mapping: [
        { key: 'model', value: 'CV' },
        { key: 'explore', value: 'service_infra_info' }
      ],
      mapped_content: 'verification of deployment stages'
    },
    {
      content: 'Verifications',
      mapping: [
        { key: 'model', value: 'CV' },
        { key: 'explore', value: 'verify_step_execution_cvng' }
      ],
      mapped_content: 'verifications of step executions'
    }
  ]
}

const DeploymentsPrompt: Prompt = {
  title: 'Deployments',
  options: [
    {
      content: 'Deployments and Services',
      mapping: [
        { key: 'model', value: 'CD' },
        { key: 'explore', value: 'pipeline_execution_summary_cd' }
      ]
    },
    {
      content: 'Deployments and Services V2',
      mapping: [
        { key: 'model', value: 'CD' },
        { key: 'explore', value: 'stage_execution_summary' }
      ]
    },
    {
      content: 'Instances',
      mapping: [
        { key: 'model', value: 'CD' },
        { key: 'explore', value: 'ng_services' }
      ],
      mapped_content: 'Deployment instances'
    },
    {
      content: 'Orgs',
      mapping: [
        { key: 'model', value: 'CD' },
        { key: 'explore', value: 'organizations' }
      ],
      mapped_content: 'Organizations'
    }
  ]
}

const FeatureFlagsPrompt: Prompt = {
  title: 'Feature Flags',
  options: [
    {
      content: 'Feature Flags',
      mapping: [
        { key: 'model', value: 'CF' },
        { key: 'explore', value: 'feature_flags' }
      ]
    },
    {
      content: 'Targets',
      mapping: [
        { key: 'model', value: 'CF' },
        { key: 'explore', value: 'targets' }
      ],
      mapped_content: 'Feature Flag targets'
    }
  ]
}

export const ExplorePrompts: Prompt[] = [
  CloudCostPrompt,
  ContinuousBuildsPrompt,
  ContinuousErrorTrackingPrompt,
  ContinuousVerificationPrompt,
  DeploymentsPrompt,
  FeatureFlagsPrompt
]
