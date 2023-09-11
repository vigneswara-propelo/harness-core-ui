import { Prompt, VisualizationType } from '@dashboards/types/AidaTypes.types'

const CloudCostPrompt: Prompt = {
  title: 'Cloud Cost Management',
  options: [
    {
      content: 'AWS',
      mapping: [
        { key: 'model', value: 'QA_CE' },
        { key: 'explore', value: 'aws' }
      ],
      mappedContent: 'AWS costs'
    },
    {
      content: 'Azure',
      mapping: [
        { key: 'model', value: 'QA_CE' },
        { key: 'explore', value: 'azure' }
      ],
      mappedContent: 'Azure costs'
    },
    {
      content: 'GCP',
      mapping: [
        { key: 'model', value: 'QA_CE' },
        { key: 'explore', value: 'gcp' }
      ],
      mappedContent: 'GCP costs'
    },
    {
      content: 'Kubernetes Cluster',
      mapping: [
        { key: 'model', value: 'QA_CE' },
        { key: 'explore', value: 'cluster' }
      ],
      mappedContent: 'Kubernetes cluster costs'
    }
  ]
}

const ContinuousBuildsPrompt: Prompt = {
  title: 'Continuous Builds',
  options: [
    {
      content: 'Builds and Repositories',
      mapping: [
        { key: 'model', value: 'QA_CI' },
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
        { key: 'model', value: 'QA_CET' },
        { key: 'explore', value: 'dashboard_invocation_daily_agg' }
      ],
      mappedContent: 'the daily aggregate of dashboard invocations'
    }
  ]
}

const ContinuousVerificationPrompt: Prompt = {
  title: 'Continuous Verification',
  options: [
    {
      content: 'Deployment Stages',
      mapping: [
        { key: 'model', value: 'QA_CV' },
        { key: 'explore', value: 'service_infra_info' }
      ],
      mappedContent: 'verification of deployment stages'
    },
    {
      content: 'Verifications',
      mapping: [
        { key: 'model', value: 'QA_CV' },
        { key: 'explore', value: 'verify_step_execution_cvng' }
      ],
      mappedContent: 'verifications of step executions'
    }
  ]
}

const DeploymentsPrompt: Prompt = {
  title: 'Deployments',
  options: [
    {
      content: 'Deployments and Services',
      mapping: [
        { key: 'model', value: 'QA_CD' },
        { key: 'explore', value: 'pipeline_execution_summary_cd' }
      ]
    },
    {
      content: 'Deployments and Services V2',
      mapping: [
        { key: 'model', value: 'QA_CD' },
        { key: 'explore', value: 'stage_execution_summary' }
      ]
    },
    {
      content: 'Instances',
      mapping: [
        { key: 'model', value: 'QA_CD' },
        { key: 'explore', value: 'ng_services' }
      ],
      mappedContent: 'Deployment instances'
    },
    {
      content: 'Orgs',
      mapping: [
        { key: 'model', value: 'QA_CD' },
        { key: 'explore', value: 'organizations' }
      ],
      mappedContent: 'Organizations'
    }
  ]
}

const FeatureFlagsPrompt: Prompt = {
  title: 'Feature Flags',
  options: [
    {
      content: 'Feature Flags',
      mapping: [
        { key: 'model', value: 'QA_CF' },
        { key: 'explore', value: 'feature_flags' }
      ]
    },
    {
      content: 'Targets',
      mapping: [
        { key: 'model', value: 'QA_CF' },
        { key: 'explore', value: 'targets' }
      ],
      mappedContent: 'Feature Flag targets'
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

const VisualizationPrompt: Prompt = {
  options: [
    {
      content: 'Table',
      mapping: [{ key: 'visualization', value: VisualizationType.Table }]
    },
    {
      content: 'Bar Chart',
      mapping: [{ key: 'visualization', value: VisualizationType.BarChart }]
    },
    {
      content: 'Line Chart',
      mapping: [{ key: 'visualization', value: VisualizationType.LineChart }]
    },
    {
      content: 'Column Chart',
      mapping: [{ key: 'visualization', value: VisualizationType.ColumnChart }]
    },
    {
      content: 'Pie Chart',
      mapping: [{ key: 'visualization', value: VisualizationType.PieChart }]
    },
    {
      content: 'Scatter Plot',
      mapping: [{ key: 'visualization', value: VisualizationType.ScatterPlot }]
    },
    {
      content: 'Single Value',
      mapping: [{ key: 'visualization', value: VisualizationType.SingleValue }]
    }
  ]
}

export const VisualizationPrompts: Prompt[] = [VisualizationPrompt]
