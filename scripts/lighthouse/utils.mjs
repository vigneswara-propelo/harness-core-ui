export const DATA_POINTS = {
  PERFORMANCE: 'Performance',
  ACCESSIBILITY: 'Accessibility',
  BEST_PRACTICES: 'Best Practices',
  SEO: 'SEO',
  TIME_TO_INTERACTIVE: 'Time To Interactive',
  FIRST_MEANINGFUL_PAINT: 'First Meaningful Paint',
  FIRST_CONTENTFUL_PAINT: 'First ContentFul Paint',
  LARGEST_CONTENTFUL_PAINT: 'Largest Contentful Paint',
  ESTIMATED_INPUT_LATENCY: 'Estimated Input Latency',
  TOTAL_BLOCKING_TIME: 'Total Blocking Time',
  FIRST_CPU_IDLE: 'First Cpu Idle',
  NETWORK_RTT: 'Network Rtt',
  NETWORK_SERVER_LATENCY: 'Network Server Latency',

  TIME_TO_INTERACTIVE_SCORE: 'Time To Interactive Score',
  FIRST_MEANINGFUL_PAINT_SCORE: 'First Meaningful Paint Score',
  FIRST_CONTENTFUL_PAINT_SCORE: 'First ContentFul Paint Score',
  LARGEST_CONTENTFUL_PAINT_SCORE: 'Largest Contentful Paint Score',
  ESTIMATED_INPUT_LATENCY_SCORE: 'Estimated Input Latency Score',
  TOTAL_BLOCKING_TIME_SCORE: 'Total Blocking Time Score',
  FIRST_CPU_IDLE_SCORE: 'First Cpu Idle Score',
  NETWORK_RTT_SCORE: 'Network Rtt Score',
  NETWORK_SERVER_LATENCY_SCORE: 'Network Server Latency Score'
}
export const getAverageResult = (listOfResults, attributeName) => {
  let listLength = listOfResults.length
  let returnAvg = 0
  if (listLength) {
    const sum = listOfResults.reduce((tempSum, ele) => {
      tempSum = tempSum + parseFloat(ele[attributeName])
      return tempSum
    }, returnAvg)
    return sum / listLength
  }
  return returnAvg
}
export const getFilterResults = resultsToBeFilterd => {
  return {
    [DATA_POINTS.PERFORMANCE]: getAverageResult(resultsToBeFilterd, DATA_POINTS.PERFORMANCE).toFixed(2),
    Accessibility: getAverageResult(resultsToBeFilterd, DATA_POINTS.ACCESSIBILITY).toFixed(2),
    [DATA_POINTS.BEST_PRACTICES]: getAverageResult(resultsToBeFilterd, DATA_POINTS.BEST_PRACTICES).toFixed(2),
    [DATA_POINTS.SEO]: getAverageResult(resultsToBeFilterd, DATA_POINTS.SEO).toFixed(2),
    [DATA_POINTS.TIME_TO_INTERACTIVE]: getAverageResult(resultsToBeFilterd, DATA_POINTS.TIME_TO_INTERACTIVE).toFixed(2),
    [DATA_POINTS.TIME_TO_INTERACTIVE_SCORE]: getAverageResult(
      resultsToBeFilterd,
      DATA_POINTS.TIME_TO_INTERACTIVE_SCORE
    ).toFixed(2),
    [DATA_POINTS.FIRST_MEANINGFUL_PAINT]: getAverageResult(
      resultsToBeFilterd,
      DATA_POINTS.FIRST_MEANINGFUL_PAINT
    ).toFixed(2),
    [DATA_POINTS.FIRST_MEANINGFUL_PAINT_SCORE]: getAverageResult(
      resultsToBeFilterd,
      DATA_POINTS.FIRST_MEANINGFUL_PAINT_SCORE
    ).toFixed(2),
    [DATA_POINTS.FIRST_CONTENTFUL_PAINT]: getAverageResult(
      resultsToBeFilterd,
      DATA_POINTS.FIRST_CONTENTFUL_PAINT
    ).toFixed(2),
    [DATA_POINTS.FIRST_CONTENTFUL_PAINT_SCORE]: getAverageResult(
      resultsToBeFilterd,
      DATA_POINTS.FIRST_CONTENTFUL_PAINT_SCORE
    ).toFixed(2),
    [DATA_POINTS.LARGEST_CONTENTFUL_PAINT]: getAverageResult(
      resultsToBeFilterd,
      DATA_POINTS.LARGEST_CONTENTFUL_PAINT
    ).toFixed(2),
    [DATA_POINTS.LARGEST_CONTENTFUL_PAINT_SCORE]: getAverageResult(
      resultsToBeFilterd,
      DATA_POINTS.LARGEST_CONTENTFUL_PAINT_SCORE
    ).toFixed(2),
    [DATA_POINTS.ESTIMATED_INPUT_LATENCY]: getAverageResult(
      resultsToBeFilterd,
      DATA_POINTS.ESTIMATED_INPUT_LATENCY
    ).toFixed(2),
    [DATA_POINTS.ESTIMATED_INPUT_LATENCY_SCORE]: getAverageResult(
      resultsToBeFilterd,
      DATA_POINTS.ESTIMATED_INPUT_LATENCY_SCORE
    ).toFixed(2),
    [DATA_POINTS.TOTAL_BLOCKING_TIME]: getAverageResult(resultsToBeFilterd, DATA_POINTS.TOTAL_BLOCKING_TIME).toFixed(2),
    [DATA_POINTS.TOTAL_BLOCKING_TIME_SCORE]: getAverageResult(
      resultsToBeFilterd,
      DATA_POINTS.TOTAL_BLOCKING_TIME_SCORE
    ).toFixed(2),
    [DATA_POINTS.FIRST_CPU_IDLE]: getAverageResult(resultsToBeFilterd, DATA_POINTS.FIRST_CPU_IDLE).toFixed(2),
    [DATA_POINTS.FIRST_CPU_IDLE_SCORE]: getAverageResult(resultsToBeFilterd, DATA_POINTS.FIRST_CPU_IDLE_SCORE).toFixed(
      2
    ),
    [DATA_POINTS.NETWORK_RTT]: getAverageResult(resultsToBeFilterd, DATA_POINTS.NETWORK_RTT).toFixed(2),
    [DATA_POINTS.NETWORK_RTT_SCORE]: getAverageResult(resultsToBeFilterd, DATA_POINTS.NETWORK_RTT_SCORE).toFixed(2),
    [DATA_POINTS.NETWORK_SERVER_LATENCY]: getAverageResult(
      resultsToBeFilterd,
      DATA_POINTS.NETWORK_SERVER_LATENCY
    ).toFixed(2),
    [DATA_POINTS.NETWORK_SERVER_LATENCY_SCORE]: getAverageResult(
      resultsToBeFilterd,
      DATA_POINTS.NETWORK_SERVER_LATENCY_SCORE
    ).toFixed(2)
  }
}
export const percentageChangeInTwoParams = (dataToBeCompared, benchMarkData, parameter) => {
  const percentageChange = parseFloat(
    ((parseFloat(dataToBeCompared) - parseFloat(benchMarkData)) / parseFloat(benchMarkData)) * 100
  ).toFixed(2)
  console.log(
    `Comparing ${parameter} Benchmark Value:${benchMarkData}, Data to be compared Value: ${dataToBeCompared} precentage change: ${percentageChange}`
  )
  return percentageChange
}
