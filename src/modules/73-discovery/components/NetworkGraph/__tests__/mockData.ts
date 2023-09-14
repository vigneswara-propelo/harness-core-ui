/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

/* istanbul ignore file */
import type { Node, Edge } from 'reactflow'
import { nodeGroupOptions, nodeOptions, NodeTypes } from '@discovery/components/NetworkGraph/constants'
import type { EdgeData } from '@discovery/components/NetworkGraph/types'

export const mockNodes: Node<unknown, NodeTypes>[] = [
  {
    id: 'ns1',
    data: { label: null },
    ...nodeGroupOptions
  },
  {
    id: 'ns2',
    data: { label: null },
    ...nodeGroupOptions
  },
  {
    id: '1',
    data: { label: 'node 1' },
    parentNode: 'ns1',
    ...nodeOptions
  },
  {
    id: '2',
    data: { label: 'node 2' },
    parentNode: 'ns1',
    ...nodeOptions
  },
  {
    id: '2a',
    data: { label: 'node 2a' },
    parentNode: 'ns1',
    ...nodeOptions
  },
  {
    id: '2b',
    data: { label: 'node 2b' },
    parentNode: 'ns1',
    ...nodeOptions
  },
  {
    id: '2c',
    data: { label: 'node 2c' },
    parentNode: 'ns1',
    ...nodeOptions
  },
  {
    id: '2d',
    data: { label: 'node 2d' },
    parentNode: 'ns1',
    ...nodeOptions
  },
  {
    id: '3',
    data: { label: 'node 3' },
    parentNode: 'ns1',
    ...nodeOptions
  },
  {
    id: '4',
    data: { label: 'node 4' },
    parentNode: 'ns2',
    ...nodeOptions
  },
  {
    id: '5',
    data: { label: 'node 5' },
    parentNode: 'ns2',
    ...nodeOptions
  },
  {
    id: '6',
    data: { label: 'node 6' },
    parentNode: 'ns2',
    ...nodeOptions
  },
  {
    id: '7',
    data: { label: 'node 7' },
    parentNode: 'ns2',
    ...nodeOptions
  }
]

export const mockEdges: Edge<EdgeData>[] = [
  {
    id: 'e12',
    source: '1',
    target: '2',
    data: { parentNode: 'ns1' }
  },
  {
    id: 'e13',
    source: '1',
    target: '3',
    data: { parentNode: 'ns1' }
  },
  {
    id: 'e22a',
    source: '2',
    target: '2a',
    data: { parentNode: 'ns1' }
  },
  {
    id: 'e22b',
    source: '2',
    target: '2b',
    data: { parentNode: 'ns1' }
  },
  {
    id: 'e22c',
    source: '2',
    target: '2c',
    data: { parentNode: 'ns1' }
  },
  {
    id: 'e2c2d',
    source: '2c',
    target: '2d',
    data: { parentNode: 'ns1' }
  },
  {
    id: 'e45',
    source: '4',
    target: '5',
    data: { parentNode: 'ns2' }
  },
  {
    id: 'e56',
    source: '5',
    target: '6',
    data: { parentNode: 'ns2' }
  },
  {
    id: 'e57',
    source: '5',
    target: '7',
    data: { parentNode: 'ns2' }
  },
  {
    id: 'e2b2d',
    source: '2b',
    target: '2d',
    data: { parentNode: 'ns1' }
  },
  {
    id: 'e2c1',
    source: '2c',
    target: '1',
    data: { parentNode: 'ns1' }
  },
  {
    id: 'e2d3',
    source: '2d',
    target: '3',
    data: { parentNode: 'ns1' }
  },
  {
    id: 'e57',
    source: '6',
    target: '3',
    data: { parentNode: 'ns2' }
  }
]

export const mockElkGraph = {
  nodes: [
    {
      id: 'ns1',
      data: {
        label: null
      },
      position: {
        x: 50,
        y: 373.99999999999994
      },
      type: 'group',
      style: {
        border: '2px dashed var(--purple-600)',
        background: 'rgba(246, 241, 255, 0.30)',
        height: 399.28571428571433,
        width: 664
      },
      children: [
        {
          id: '1',
          data: {
            label: 'node 1'
          },
          parentNode: 'ns1',
          position: {
            x: 0,
            y: 0
          },
          width: 100,
          height: 100,
          type: 'hexagon',
          expandParent: true,
          targetPosition: 'top',
          sourcePosition: 'bottom',
          $H: 944,
          x: 12,
          y: 287.28571428571433
        },
        {
          id: '2',
          data: {
            label: 'node 2'
          },
          parentNode: 'ns1',
          position: {
            x: 0,
            y: 0
          },
          width: 100,
          height: 100,
          type: 'hexagon',
          expandParent: true,
          targetPosition: 'top',
          sourcePosition: 'bottom',
          $H: 946,
          x: 162,
          y: 133.4761904761905
        },
        {
          id: '2a',
          data: {
            label: 'node 2a'
          },
          parentNode: 'ns1',
          position: {
            x: 0,
            y: 0
          },
          width: 100,
          height: 100,
          type: 'hexagon',
          expandParent: true,
          targetPosition: 'top',
          sourcePosition: 'bottom',
          $H: 948,
          x: 302,
          y: 23
        },
        {
          id: '2b',
          data: {
            label: 'node 2b'
          },
          parentNode: 'ns1',
          position: {
            x: 0,
            y: 0
          },
          width: 100,
          height: 100,
          type: 'hexagon',
          expandParent: true,
          targetPosition: 'top',
          sourcePosition: 'bottom',
          $H: 950,
          x: 302,
          y: 143.00000000000003
        },
        {
          id: '2c',
          data: {
            label: 'node 2c'
          },
          parentNode: 'ns1',
          position: {
            x: 0,
            y: 0
          },
          width: 100,
          height: 100,
          type: 'hexagon',
          expandParent: true,
          targetPosition: 'top',
          sourcePosition: 'bottom',
          $H: 952,
          x: 302,
          y: 263
        },
        {
          id: '2d',
          data: {
            label: 'node 2d'
          },
          parentNode: 'ns1',
          position: {
            x: 0,
            y: 0
          },
          width: 100,
          height: 100,
          type: 'hexagon',
          expandParent: true,
          targetPosition: 'top',
          sourcePosition: 'bottom',
          $H: 954,
          x: 432,
          y: 236.33333333333337
        },
        {
          id: '3',
          data: {
            label: 'node 3'
          },
          parentNode: 'ns1',
          position: {
            x: 0,
            y: 0
          },
          width: 100,
          height: 100,
          type: 'hexagon',
          expandParent: true,
          targetPosition: 'top',
          sourcePosition: 'bottom',
          $H: 956,
          x: 552,
          y: 229.66666666666669
        }
      ],
      edges: [
        {
          id: 'e12',
          source: '1',
          target: '2',
          data: {
            parentNode: 'ns1'
          },
          sections: [
            {
              id: 'e12_s0',
              startPoint: {
                x: 112,
                y: 315.8571428571429
              },
              endPoint: {
                x: 162,
                y: 166.80952380952385
              },
              bendPoints: [
                {
                  x: 132,
                  y: 315.8571428571429
                },
                {
                  x: 132,
                  y: 166.80952380952385
                }
              ],
              incomingShape: '1',
              outgoingShape: '2'
            }
          ],
          container: 'ns1'
        },
        {
          id: 'e13',
          source: '1',
          target: '3',
          data: {
            parentNode: 'ns1'
          },
          sections: [
            {
              id: 'e13_s0',
              startPoint: {
                x: 112,
                y: 373
              },
              endPoint: {
                x: 552,
                y: 309.6666666666667
              },
              bendPoints: [
                {
                  x: 542,
                  y: 373
                },
                {
                  x: 542,
                  y: 309.6666666666667
                }
              ],
              incomingShape: '1',
              outgoingShape: '3'
            }
          ],
          container: 'ns1'
        },
        {
          id: 'e22a',
          source: '2',
          target: '2a',
          data: {
            parentNode: 'ns1'
          },
          sections: [
            {
              id: 'e22a_s0',
              startPoint: {
                x: 262,
                y: 147.7619047619048
              },
              endPoint: {
                x: 302,
                y: 56.33333333333333
              },
              bendPoints: [
                {
                  x: 272,
                  y: 147.7619047619048
                },
                {
                  x: 272,
                  y: 56.333333333333314
                }
              ],
              incomingShape: '2',
              outgoingShape: '2a'
            }
          ],
          container: 'ns1'
        },
        {
          id: 'e22b',
          source: '2',
          target: '2b',
          data: {
            parentNode: 'ns1'
          },
          sections: [
            {
              id: 'e22b_s0',
              startPoint: {
                x: 262,
                y: 176.33333333333337
              },
              endPoint: {
                x: 302,
                y: 176.33333333333337
              },
              incomingShape: '2',
              outgoingShape: '2b'
            }
          ],
          container: 'ns1'
        },
        {
          id: 'e22c',
          source: '2',
          target: '2c',
          data: {
            parentNode: 'ns1'
          },
          sections: [
            {
              id: 'e22c_s0',
              startPoint: {
                x: 262,
                y: 219.1904761904762
              },
              endPoint: {
                x: 302,
                y: 303
              },
              bendPoints: [
                {
                  x: 272,
                  y: 219.1904761904762
                },
                {
                  x: 272,
                  y: 303
                }
              ],
              incomingShape: '2',
              outgoingShape: '2c'
            }
          ],
          container: 'ns1'
        },
        {
          id: 'e2c2d',
          source: '2c',
          target: '2d',
          data: {
            parentNode: 'ns1'
          },
          sections: [
            {
              id: 'e2c2d_s0',
              startPoint: {
                x: 402,
                y: 329.6666666666667
              },
              endPoint: {
                x: 432,
                y: 316.33333333333337
              },
              bendPoints: [
                {
                  x: 412,
                  y: 329.6666666666667
                },
                {
                  x: 412,
                  y: 316.33333333333337
                }
              ],
              incomingShape: '2c',
              outgoingShape: '2d'
            }
          ],
          container: 'ns1'
        },
        {
          id: 'e2b2d',
          source: '2b',
          target: '2d',
          data: {
            parentNode: 'ns1'
          },
          sections: [
            {
              id: 'e2b2d_s0',
              startPoint: {
                x: 402,
                y: 176.33333333333337
              },
              endPoint: {
                x: 432,
                y: 256.33333333333337
              },
              bendPoints: [
                {
                  x: 422,
                  y: 176.33333333333337
                },
                {
                  x: 422,
                  y: 256.33333333333337
                }
              ],
              incomingShape: '2b',
              outgoingShape: '2d'
            }
          ],
          container: 'ns1'
        },
        {
          id: 'e2c1',
          source: '2c',
          target: '1',
          data: {
            parentNode: 'ns1'
          },
          sections: [
            {
              id: 'e2c1_s0',
              startPoint: {
                x: 302,
                y: 323
              },
              endPoint: {
                x: 112,
                y: 344.42857142857144
              },
              bendPoints: [
                {
                  x: 152,
                  y: 323
                },
                {
                  x: 152,
                  y: 344.42857142857144
                }
              ],
              incomingShape: '2c',
              outgoingShape: '1'
            }
          ],
          container: 'ns1'
        },
        {
          id: 'e2d3',
          source: '2d',
          target: '3',
          data: {
            parentNode: 'ns1'
          },
          sections: [
            {
              id: 'e2d3_s0',
              startPoint: {
                x: 532,
                y: 269.6666666666667
              },
              endPoint: {
                x: 552,
                y: 269.6666666666667
              },
              incomingShape: '2d',
              outgoingShape: '3'
            }
          ],
          container: 'ns1'
        }
      ],
      width: 664,
      height: 399.28571428571433,
      $H: 942,
      x: 50,
      y: 373.99999999999994
    },
    {
      id: 'ns2',
      data: {
        label: null
      },
      position: {
        x: 50,
        y: 50
      },
      type: 'group',
      style: {
        border: '2px dashed var(--purple-600)',
        background: 'rgba(246, 241, 255, 0.30)',
        height: 244,
        width: 374
      },
      children: [
        {
          id: '4',
          data: {
            label: 'node 4'
          },
          parentNode: 'ns2',
          position: {
            x: 0,
            y: 0
          },
          width: 100,
          height: 100,
          type: 'hexagon',
          expandParent: true,
          targetPosition: 'top',
          sourcePosition: 'bottom',
          $H: 960,
          x: 12,
          y: 25.33333333333333
        },
        {
          id: '5',
          data: {
            label: 'node 5'
          },
          parentNode: 'ns2',
          position: {
            x: 0,
            y: 0
          },
          width: 100,
          height: 100,
          type: 'hexagon',
          expandParent: true,
          targetPosition: 'top',
          sourcePosition: 'bottom',
          $H: 962,
          x: 132,
          y: 25.33333333333333
        },
        {
          id: '6',
          data: {
            label: 'node 6'
          },
          parentNode: 'ns2',
          position: {
            x: 0,
            y: 0
          },
          width: 100,
          height: 100,
          type: 'hexagon',
          expandParent: true,
          targetPosition: 'top',
          sourcePosition: 'bottom',
          $H: 964,
          x: 262,
          y: 12
        },
        {
          id: '7',
          data: {
            label: 'node 7'
          },
          parentNode: 'ns2',
          position: {
            x: 0,
            y: 0
          },
          width: 100,
          height: 100,
          type: 'hexagon',
          expandParent: true,
          targetPosition: 'top',
          sourcePosition: 'bottom',
          $H: 966,
          x: 262,
          y: 132
        }
      ],
      edges: [
        {
          id: 'e45',
          source: '4',
          target: '5',
          data: {
            parentNode: 'ns2'
          },
          sections: [
            {
              id: 'e45_s0',
              startPoint: {
                x: 112,
                y: 58.66666666666666
              },
              endPoint: {
                x: 132,
                y: 58.66666666666666
              },
              incomingShape: '4',
              outgoingShape: '5'
            }
          ],
          container: 'ns2'
        },
        {
          id: 'e56',
          source: '5',
          target: '6',
          data: {
            parentNode: 'ns2'
          },
          sections: [
            {
              id: 'e56_s0',
              startPoint: {
                x: 232,
                y: 45.33333333333333
              },
              endPoint: {
                x: 262,
                y: 45.33333333333333
              },
              incomingShape: '5',
              outgoingShape: '6'
            }
          ],
          container: 'ns2'
        },
        {
          id: 'e57',
          source: '5',
          target: '7',
          data: {
            parentNode: 'ns2'
          },
          sections: [
            {
              id: 'e57_s0',
              startPoint: {
                x: 232,
                y: 85.33333333333333
              },
              endPoint: {
                x: 262,
                y: 165.33333333333331
              },
              bendPoints: [
                {
                  x: 252,
                  y: 85.33333333333333
                },
                {
                  x: 252,
                  y: 165.33333333333331
                }
              ],
              incomingShape: '5',
              outgoingShape: '7'
            }
          ],
          container: 'ns2'
        },
        {
          id: 'e57',
          source: '6',
          target: '3',
          data: {
            parentNode: 'ns2'
          },
          container: 'root'
        }
      ],
      width: 374,
      height: 244,
      $H: 958,
      x: 50,
      y: 50
    },
    {
      id: '1',
      data: {
        label: 'node 1'
      },
      parentNode: 'ns1',
      position: {
        x: 12,
        y: 287.28571428571433
      },
      style: {},
      width: 100,
      height: 100,
      type: 'hexagon',
      expandParent: true,
      targetPosition: 'top',
      sourcePosition: 'bottom',
      $H: 944,
      x: 12,
      y: 287.28571428571433
    },
    {
      id: '2',
      data: {
        label: 'node 2'
      },
      parentNode: 'ns1',
      position: {
        x: 162,
        y: 133.4761904761905
      },
      style: {},
      width: 100,
      height: 100,
      type: 'hexagon',
      expandParent: true,
      targetPosition: 'top',
      sourcePosition: 'bottom',
      $H: 946,
      x: 162,
      y: 133.4761904761905
    },
    {
      id: '2a',
      data: {
        label: 'node 2a'
      },
      parentNode: 'ns1',
      position: {
        x: 302,
        y: 23
      },
      style: {},
      width: 100,
      height: 100,
      type: 'hexagon',
      expandParent: true,
      targetPosition: 'top',
      sourcePosition: 'bottom',
      $H: 948,
      x: 302,
      y: 23
    },
    {
      id: '2b',
      data: {
        label: 'node 2b'
      },
      parentNode: 'ns1',
      position: {
        x: 302,
        y: 143.00000000000003
      },
      style: {},
      width: 100,
      height: 100,
      type: 'hexagon',
      expandParent: true,
      targetPosition: 'top',
      sourcePosition: 'bottom',
      $H: 950,
      x: 302,
      y: 143.00000000000003
    },
    {
      id: '2c',
      data: {
        label: 'node 2c'
      },
      parentNode: 'ns1',
      position: {
        x: 302,
        y: 263
      },
      style: {},
      width: 100,
      height: 100,
      type: 'hexagon',
      expandParent: true,
      targetPosition: 'top',
      sourcePosition: 'bottom',
      $H: 952,
      x: 302,
      y: 263
    },
    {
      id: '2d',
      data: {
        label: 'node 2d'
      },
      parentNode: 'ns1',
      position: {
        x: 432,
        y: 236.33333333333337
      },
      style: {},
      width: 100,
      height: 100,
      type: 'hexagon',
      expandParent: true,
      targetPosition: 'top',
      sourcePosition: 'bottom',
      $H: 954,
      x: 432,
      y: 236.33333333333337
    },
    {
      id: '3',
      data: {
        label: 'node 3'
      },
      parentNode: 'ns1',
      position: {
        x: 552,
        y: 229.66666666666669
      },
      style: {},
      width: 100,
      height: 100,
      type: 'hexagon',
      expandParent: true,
      targetPosition: 'top',
      sourcePosition: 'bottom',
      $H: 956,
      x: 552,
      y: 229.66666666666669
    },
    {
      id: '4',
      data: {
        label: 'node 4'
      },
      parentNode: 'ns2',
      position: {
        x: 12,
        y: 25.33333333333333
      },
      style: {},
      width: 100,
      height: 100,
      type: 'hexagon',
      expandParent: true,
      targetPosition: 'top',
      sourcePosition: 'bottom',
      $H: 960,
      x: 12,
      y: 25.33333333333333
    },
    {
      id: '5',
      data: {
        label: 'node 5'
      },
      parentNode: 'ns2',
      position: {
        x: 132,
        y: 25.33333333333333
      },
      style: {},
      width: 100,
      height: 100,
      type: 'hexagon',
      expandParent: true,
      targetPosition: 'top',
      sourcePosition: 'bottom',
      $H: 962,
      x: 132,
      y: 25.33333333333333
    },
    {
      id: '6',
      data: {
        label: 'node 6'
      },
      parentNode: 'ns2',
      position: {
        x: 262,
        y: 12
      },
      style: {},
      width: 100,
      height: 100,
      type: 'hexagon',
      expandParent: true,
      targetPosition: 'top',
      sourcePosition: 'bottom',
      $H: 964,
      x: 262,
      y: 12
    },
    {
      id: '7',
      data: {
        label: 'node 7'
      },
      parentNode: 'ns2',
      position: {
        x: 262,
        y: 132
      },
      style: {},
      width: 100,
      height: 100,
      type: 'hexagon',
      expandParent: true,
      targetPosition: 'top',
      sourcePosition: 'bottom',
      $H: 966,
      x: 262,
      y: 132
    }
  ],
  edges: [
    {
      id: 'e12',
      source: '1',
      target: '2',
      data: {
        parentNode: 'ns1'
      },
      sections: [
        {
          id: 'e12_s0',
          startPoint: {
            x: 112,
            y: 315.8571428571429
          },
          endPoint: {
            x: 162,
            y: 166.80952380952385
          },
          bendPoints: [
            {
              x: 132,
              y: 315.8571428571429
            },
            {
              x: 132,
              y: 166.80952380952385
            }
          ],
          incomingShape: '1',
          outgoingShape: '2'
        }
      ],
      container: 'ns1'
    },
    {
      id: 'e13',
      source: '1',
      target: '3',
      data: {
        parentNode: 'ns1'
      },
      sections: [
        {
          id: 'e13_s0',
          startPoint: {
            x: 112,
            y: 373
          },
          endPoint: {
            x: 552,
            y: 309.6666666666667
          },
          bendPoints: [
            {
              x: 542,
              y: 373
            },
            {
              x: 542,
              y: 309.6666666666667
            }
          ],
          incomingShape: '1',
          outgoingShape: '3'
        }
      ],
      container: 'ns1'
    },
    {
      id: 'e22a',
      source: '2',
      target: '2a',
      data: {
        parentNode: 'ns1'
      },
      sections: [
        {
          id: 'e22a_s0',
          startPoint: {
            x: 262,
            y: 147.7619047619048
          },
          endPoint: {
            x: 302,
            y: 56.33333333333333
          },
          bendPoints: [
            {
              x: 272,
              y: 147.7619047619048
            },
            {
              x: 272,
              y: 56.333333333333314
            }
          ],
          incomingShape: '2',
          outgoingShape: '2a'
        }
      ],
      container: 'ns1'
    },
    {
      id: 'e22b',
      source: '2',
      target: '2b',
      data: {
        parentNode: 'ns1'
      },
      sections: [
        {
          id: 'e22b_s0',
          startPoint: {
            x: 262,
            y: 176.33333333333337
          },
          endPoint: {
            x: 302,
            y: 176.33333333333337
          },
          incomingShape: '2',
          outgoingShape: '2b'
        }
      ],
      container: 'ns1'
    },
    {
      id: 'e22c',
      source: '2',
      target: '2c',
      data: {
        parentNode: 'ns1'
      },
      sections: [
        {
          id: 'e22c_s0',
          startPoint: {
            x: 262,
            y: 219.1904761904762
          },
          endPoint: {
            x: 302,
            y: 303
          },
          bendPoints: [
            {
              x: 272,
              y: 219.1904761904762
            },
            {
              x: 272,
              y: 303
            }
          ],
          incomingShape: '2',
          outgoingShape: '2c'
        }
      ],
      container: 'ns1'
    },
    {
      id: 'e2c2d',
      source: '2c',
      target: '2d',
      data: {
        parentNode: 'ns1'
      },
      sections: [
        {
          id: 'e2c2d_s0',
          startPoint: {
            x: 402,
            y: 329.6666666666667
          },
          endPoint: {
            x: 432,
            y: 316.33333333333337
          },
          bendPoints: [
            {
              x: 412,
              y: 329.6666666666667
            },
            {
              x: 412,
              y: 316.33333333333337
            }
          ],
          incomingShape: '2c',
          outgoingShape: '2d'
        }
      ],
      container: 'ns1'
    },
    {
      id: 'e45',
      source: '4',
      target: '5',
      data: {
        parentNode: 'ns2'
      },
      sections: [
        {
          id: 'e45_s0',
          startPoint: {
            x: 112,
            y: 58.66666666666666
          },
          endPoint: {
            x: 132,
            y: 58.66666666666666
          },
          incomingShape: '4',
          outgoingShape: '5'
        }
      ],
      container: 'ns2'
    },
    {
      id: 'e56',
      source: '5',
      target: '6',
      data: {
        parentNode: 'ns2'
      },
      sections: [
        {
          id: 'e56_s0',
          startPoint: {
            x: 232,
            y: 45.33333333333333
          },
          endPoint: {
            x: 262,
            y: 45.33333333333333
          },
          incomingShape: '5',
          outgoingShape: '6'
        }
      ],
      container: 'ns2'
    },
    {
      id: 'e57',
      source: '5',
      target: '7',
      data: {
        parentNode: 'ns2'
      },
      sections: [
        {
          id: 'e57_s0',
          startPoint: {
            x: 232,
            y: 85.33333333333333
          },
          endPoint: {
            x: 262,
            y: 165.33333333333331
          },
          bendPoints: [
            {
              x: 252,
              y: 85.33333333333333
            },
            {
              x: 252,
              y: 165.33333333333331
            }
          ],
          incomingShape: '5',
          outgoingShape: '7'
        }
      ],
      container: 'ns2'
    },
    {
      id: 'e2b2d',
      source: '2b',
      target: '2d',
      data: {
        parentNode: 'ns1'
      },
      sections: [
        {
          id: 'e2b2d_s0',
          startPoint: {
            x: 402,
            y: 176.33333333333337
          },
          endPoint: {
            x: 432,
            y: 256.33333333333337
          },
          bendPoints: [
            {
              x: 422,
              y: 176.33333333333337
            },
            {
              x: 422,
              y: 256.33333333333337
            }
          ],
          incomingShape: '2b',
          outgoingShape: '2d'
        }
      ],
      container: 'ns1'
    },
    {
      id: 'e2c1',
      source: '2c',
      target: '1',
      data: {
        parentNode: 'ns1'
      },
      sections: [
        {
          id: 'e2c1_s0',
          startPoint: {
            x: 302,
            y: 323
          },
          endPoint: {
            x: 112,
            y: 344.42857142857144
          },
          bendPoints: [
            {
              x: 152,
              y: 323
            },
            {
              x: 152,
              y: 344.42857142857144
            }
          ],
          incomingShape: '2c',
          outgoingShape: '1'
        }
      ],
      container: 'ns1'
    },
    {
      id: 'e2d3',
      source: '2d',
      target: '3',
      data: {
        parentNode: 'ns1'
      },
      sections: [
        {
          id: 'e2d3_s0',
          startPoint: {
            x: 532,
            y: 269.6666666666667
          },
          endPoint: {
            x: 552,
            y: 269.6666666666667
          },
          incomingShape: '2d',
          outgoingShape: '3'
        }
      ],
      container: 'ns1'
    },
    {
      id: 'e57',
      source: '6',
      target: '3',
      data: {
        parentNode: 'ns2'
      },
      container: 'root'
    }
  ]
}
