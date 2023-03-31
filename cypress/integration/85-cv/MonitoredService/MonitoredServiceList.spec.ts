import { countOfServiceAPI, monitoredServiceListCall } from '../../../support/85-cv/monitoredService/constants'
import {
  heatlhScore,
  heatlhScoreTimeLine,
  overAllHeatlhScore,
  monitoredServiceData,
  monitoredServiceListData,
  metrics,
  healthSourceList,
  serviceScreenLogsListURL,
  serviceScreenLogsListData,
  serviceScreenLogsRadarClusterURL,
  serviceScreenLogsRadarClusterData,
  monitoredServiceSLOsFetchCall,
  monitoredServiceSLOsListResponse,
  monitoredServiceSLOsRiskCountCall
} from '../../../support/85-cv/monitoredService/service-health/constants'

import {
  getSLORiskCountResponse,
  getUserJourneysCall,
  listUserJourneysCallResponse,
  getMonitoredService,
  getMonitoredServiceResponse
} from '../../../support/85-cv/slos/constants'

describe('Load service health dashboard', () => {
  beforeEach(() => {
    cy.login('test', 'test')
    cy.intercept('GET', monitoredServiceListCall, monitoredServiceListData)
    cy.intercept('GET', countOfServiceAPI, { allServicesCount: 1, servicesAtRiskCount: 0 })
    cy.visitChangeIntelligence()
  })
  it('Load dashboard', () => {
    cy.intercept('GET', '/cv/api/monitored-service/appd_prod?*', monitoredServiceData).as('monitoredServiceCall')
    cy.intercept('GET', heatlhScore.url, heatlhScore.data).as('heatlhScoreCall')
    cy.intercept('GET', heatlhScoreTimeLine.url, heatlhScoreTimeLine.data).as('heatlhScoreTimeLineCall')
    cy.intercept('GET', overAllHeatlhScore.url, overAllHeatlhScore.data).as('overAllHeatlhScoreCall')
    cy.intercept('GET', healthSourceList.url, healthSourceList.data).as('healthSourceListCall')
    cy.intercept('GET', metrics.url, metrics.data).as('metricsCall')
    cy.intercept('GET', serviceScreenLogsListURL, serviceScreenLogsListData).as('serviceScreenLogsListCall')
    cy.intercept('GET', serviceScreenLogsRadarClusterURL, serviceScreenLogsRadarClusterData).as(
      'serviceScreenLogsRadarClusterCall'
    )

    cy.intercept('GET', monitoredServiceSLOsFetchCall, monitoredServiceSLOsListResponse).as(
      'monitoredServiceSLOsFetchCall'
    )
    cy.intercept('GET', monitoredServiceSLOsRiskCountCall, getSLORiskCountResponse).as(
      'monitoredServiceSLOsRiskCountCall'
    )

    cy.intercept('GET', getUserJourneysCall, listUserJourneysCallResponse)
    cy.intercept('GET', getMonitoredService, getMonitoredServiceResponse)

    cy.contains('p', 'Monitored Services').click({ force: true })
    cy.contains('p', 'appd').click()
    cy.wait('@monitoredServiceCall')
    cy.wait('@monitoredServiceSLOsFetchCall')
  })
})
