import type Highcharts from 'highcharts'
import { merge } from 'lodash-es'

export const getScoreComparisonChartOptions = (
  {
    userScore,
    questionOrgScore,
    questionBenchMarkScore
  }: {
    userScore?: number
    questionOrgScore?: number
    questionBenchMarkScore?: number
  },
  options?: Highcharts.Options
): Highcharts.Options => {
  const defautOptions = {
    chart: {
      type: 'bar',
      spacing: [0, 0, 0, 0],
      height: 130,
      width: 500
    },
    credits: undefined,
    title: {
      text: ''
    },
    legend: {
      enabled: false
    },
    plotOptions: {
      series: {
        marker: {
          states: {
            hover: {
              enabled: false
            }
          },
          enabled: false,
          radius: 1
        }
      },
      bar: {
        pointWidth: 15,
        pointPadding: 0.1,
        dataLabels: {
          enabled: true, // Enable data labels
          format: '{y}' // Set the format of the data labels
        },
        states: {
          hover: {
            enabled: false // Disable the hover effect
          }
        }
      }
    },
    tooltip: {
      enabled: false
    },
    xAxis: {
      title: {
        text: ''
      },
      labels: {
        enabled: false
      },
      gridLineWidth: 0,
      lineWidth: 0,
      tickLength: 0,
      categories: ['Your Score', 'Company score', 'Benchmark', 'Maximum Score']
    },
    yAxis: {
      labels: { enabled: false },
      title: {
        text: ''
      },
      gridLineWidth: 0,
      lineWidth: 0,
      tickLength: 0
    },
    series: [
      {
        name: 'Your Score',
        data: [userScore],
        color: '#3DC7F6'
      },
      {
        name: 'Company score',
        data: [questionOrgScore],
        color: '#FFA86B'
      },
      {
        name: 'Benchmark',
        data: [questionBenchMarkScore],
        color: '#FDD13B'
      }
    ]
  }

  const completeOptions = merge(defautOptions, options)
  return completeOptions
}

export const getWeightageChartOptions = (weightage: number, options?: Highcharts.Options): Highcharts.Options => {
  const defautOptions = {
    chart: {
      type: 'bar',
      spacing: [0, 0, 0, 0],
      height: 30,
      width: 150
    },
    credits: undefined,
    title: {
      text: ''
    },
    legend: {
      enabled: false
    },
    plotOptions: {
      series: {
        marker: {
          states: {
            hover: {
              enabled: false
            }
          },
          enabled: false,
          radius: 1
        },
        stacking: 'normal',
        dataLabels: {
          enabled: true
        }
      },

      bar: {
        states: {
          hover: {
            enabled: false // Disable the hover effect
          }
        }
        // borderRadius: 5
      }
    },
    tooltip: {
      enabled: false
    },
    xAxis: {
      title: {
        text: ''
      },
      labels: {
        enabled: false
      },
      gridLineWidth: 0,
      lineWidth: 0,
      tickLength: 0
    },
    yAxis: {
      labels: { enabled: false },
      title: {
        text: ''
      },
      gridLineWidth: 0,
      lineWidth: 0,
      tickLength: 0,
      categories: ['Weightage', 'Remaining Weightage']
    },
    series: [
      {
        name: 'Remaining Weightage',
        data: [{ y: 100 - weightage, borderRadius: [0, 5, 5, 0] }],
        color: '#F3F3FA'
      },
      {
        name: 'Weightage',
        data: [{ y: weightage, borderRadius: [5, 0, 0, 5] }],
        color: '#2BB1F2'
      }
    ]
  }

  const completeOptions = merge(defautOptions, options)
  return completeOptions
}
