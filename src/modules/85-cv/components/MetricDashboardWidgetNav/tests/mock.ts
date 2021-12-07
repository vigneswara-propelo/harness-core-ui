import type {
  MetricDashboardItem,
  MetricWidget
} from '@cv/components/MetricDashboardWidgetNav/MetricDashboardWidgetNav.type'

export const MockDashboards: MetricDashboardItem[] = [
  {
    itemId: 'dashboard_id_1',
    title: 'dashboard_id_title'
  },
  {
    itemId: 'dashboard_id_2',
    title: 'dashboard_id_title_2'
  }
]

export const MockWidgetsResponse: MetricWidget[] = [
  {
    widgetName: 'widget_1',
    dataSets: [
      {
        name: 'metric_1',
        query: 'test query 1'
      },
      {
        name: 'metric_2',
        query: 'test query 2'
      },
      {
        name: 'metric_3',
        query: '7578768678'
      }
    ]
  },
  {
    widgetName: 'bad_widget',
    dataSets: []
  },
  {
    widgetName: 'widget_2',
    dataSets: [
      {
        name: 'metric_4',
        query: '5654grt46'
      }
    ]
  }
]

export const MockConnectorIdentifier = '1234_connectorIdentifier'
