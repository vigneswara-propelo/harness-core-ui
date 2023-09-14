/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getRelatedServices } from '../getRelatedServices'
import { mockConnections, mockServices } from './mocks'

describe('getRelatedServices', () => {
  test('test function wih mock data', async () => {
    const resultantRelatedService = mockServices.items
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const relatedServices = getRelatedServices('64920dc166c663ba792cf3b0', mockServices, mockConnections)
    expect(relatedServices).toStrictEqual(resultantRelatedService)
  })

  test('test function wih empty data', async () => {
    const relatedServices = getRelatedServices('64920dc166c663ba792cf3b0', null, null)
    expect(relatedServices).toBeUndefined()
  })
})
