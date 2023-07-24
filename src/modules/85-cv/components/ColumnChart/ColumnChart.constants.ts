/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const COLUMN_HEIGHT = 90
export const COLUMN_WIDTH = 12
export const TOTAL_COLUMNS = 48

export const LOADING_COLUMN_HEIGHTS = Array(TOTAL_COLUMNS)
  .fill(null)
  .map(() => Math.random() * 101)

export const multiMarkerBufferOffset = 34
