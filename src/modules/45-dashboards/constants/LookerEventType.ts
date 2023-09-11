/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const LookerEmbeddedFrameId = 'looker-dashboard'

export const buildBaseLookerAction = (action: LookerActionType): string => {
  return JSON.stringify({
    type: action
  })
}

export enum LookerActionType {
  DASHBOARD_STOP = 'dashboard:stop',
  DASHBOARD_RUN = 'dashboard:run',
  DASHBOARD_LOAD = 'dashboard:load'
}

export enum LookerEventType {
  DASHBOARD_EDIT_CANCEL = 'dashboard:edit:cancel',
  DASHBOARD_EDIT_START = 'dashboard:edit:start',
  DASHBOARD_FILTERS_CHANGED = 'dashboard:filters:changed',
  DASHBOARD_LOADED = 'dashboard:loaded',
  DASHBOARD_SAVE_COMPLETE = 'dashboard:save:complete',
  DASHBOARD_RUN_COMPLETE = 'dashboard:run:complete',
  PAGE_CHANGED = 'page:changed'
}
