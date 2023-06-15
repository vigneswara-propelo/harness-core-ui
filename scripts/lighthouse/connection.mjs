import mysql from 'mysql'
import { DATA_POINTS } from './utils.mjs'
const convertMapDataToRows = (mapData, env, bench_mark_passed) => {
  const rowsData = []
  const date = new Date()
  mapData.forEach((value, key) => {
    rowsData.push([
      key,
      value['url'],
      parseFloat(value[DATA_POINTS.PERFORMANCE]) || 0,
      parseFloat(value[DATA_POINTS.ACCESSIBILITY]) || 0,
      parseFloat(value[DATA_POINTS.BEST_PRACTICES]) || 0,
      parseFloat(value[DATA_POINTS.SEO]) || 0,
      parseFloat(value[DATA_POINTS.TIME_TO_INTERACTIVE]) || 0,
      parseFloat(value[DATA_POINTS.FIRST_CONTENTFUL_PAINT]) || 0,
      parseFloat(value[DATA_POINTS.FIRST_MEANINGFUL_PAINT]) || 0,
      parseFloat(value[DATA_POINTS.LARGEST_CONTENTFUL_PAINT]) || 0,
      parseFloat(value[DATA_POINTS.ESTIMATED_INPUT_LATENCY]) || 0,
      parseFloat(value[DATA_POINTS.TOTAL_BLOCKING_TIME]) || 0,
      parseFloat(value[DATA_POINTS.FIRST_CPU_IDLE]) || 0,
      parseFloat(value[DATA_POINTS.NETWORK_RTT]) || 0,
      parseFloat(value[DATA_POINTS.NETWORK_SERVER_LATENCY]) || 0,

      parseFloat(value[DATA_POINTS.TIME_TO_INTERACTIVE_SCORE]) || 0,
      parseFloat(value[DATA_POINTS.FIRST_CONTENTFUL_PAINT_SCORE]) || 0,
      parseFloat(value[DATA_POINTS.FIRST_MEANINGFUL_PAINT_SCORE]) || 0,
      parseFloat(value[DATA_POINTS.LARGEST_CONTENTFUL_PAINT_SCORE]) || 0,
      parseFloat(value[DATA_POINTS.ESTIMATED_INPUT_LATENCY_SCORE]) || 0,
      parseFloat(value[DATA_POINTS.TOTAL_BLOCKING_TIME_SCORE]) || 0,
      parseFloat(value[DATA_POINTS.FIRST_CPU_IDLE_SCORE]) || 0,
      parseFloat(value[DATA_POINTS.NETWORK_RTT_SCORE]) || 0,
      parseFloat(value[DATA_POINTS.NETWORK_SERVER_LATENCY_SCORE]) || 0,

      env,
      date,
      bench_mark_passed
    ])
  })
  return rowsData
}
const emptyPastData = {
  [DATA_POINTS.PERFORMANCE]: 0,
  [DATA_POINTS.ACCESSIBILITY]: 0,
  [DATA_POINTS.BEST_PRACTICES]: 0,
  [DATA_POINTS.SEO]: 0,
  [DATA_POINTS.TIME_TO_INTERACTIVE]: 0,
  [DATA_POINTS.FIRST_CONTENTFUL_PAINT]: 0,
  [DATA_POINTS.FIRST_MEANINGFUL_PAINT]: 0
}
const convertRowDataObject = rowData => {
  const rowsData = []
  const date = new Date()
  if (rowData.length > 0) {
    const data = rowData[0]

    return {
      [DATA_POINTS.PERFORMANCE]: data.performance,
      [DATA_POINTS.ACCESSIBILITY]: data.accessibility,
      [DATA_POINTS.BEST_PRACTICES]: data.best_practises,
      [DATA_POINTS.SEO]: data.seo,
      [DATA_POINTS.TIME_TO_INTERACTIVE]: data.time_to_interactive,
      [DATA_POINTS.FIRST_CONTENTFUL_PAINT]: data.first_contentful_paint,
      [DATA_POINTS.FIRST_MEANINGFUL_PAINT]: data.first_meaningful_paint
    }
  }
  return emptyPastData
}
/* for local development
const connectiondDetails = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'test1',
  multipleStatements: true
}
*/

const connectiondDetails = {
  host: process.env.mysql_ip, // to be decided
  user: process.env.mysql_user,
  password: process.env.mysql_pass,
  database: process.env.mysql_db,
  multipleStatements: true
}

const mysqlConnection = mysql.createPool(connectiondDetails)
const createDatabaseAndTable = () => {
  const returnPromise = new Promise((resolve, reject) => {
    mysqlConnection.getConnection((err, connection) => {
      if (!err) {
        console.log('connected')
        const dbQuery = `create database if not exists lighthouse`
        connection.query(dbQuery, (error, result) => {
          if (!error) {
            console.log('database created', result)
            var tableQry = `CREATE TABLE if not exists lighthouse.lighthouseData (id INT AUTO_INCREMENT PRIMARY KEY, pagename VARCHAR(255), url VARCHAR(255),performance float(10,2),accessibility float(10,2),best_practises float(10,2),seo float(10,2),time_to_interactive float(10,2),first_contentful_paint float(10,2),first_meaningful_paint float(10,2),largest_contentful_paint float(10,2), estimated_input_latency float(10,2), total_blocking_time float(10,2),  first_cpu_idle float(10,2), network_rtt float(10,2), network_server_latency float(10,2),time_to_interactive_score float(10,2),first_contentful_paint_score float(10,2),first_meaningful_paint_score float(10,2),st_contentful_paint_score float(10,2), estimated_input_latency_score float(10,2), total_blocking_time_score float(10,2),  first_cpu_idle_score float(10,2), network_rtt_score float(10,2), network_server_latency_score float(10,2),environment Varchar(100),created datetime,bench_mark_passed Boolean)`
            connection.query(tableQry, (tableError, tableResult) => {
              if (!tableError) {
                console.log('table created', tableResult)
                connection.release()
                resolve('table Created')
              } else {
                connection.release()
                reject(tableError)
              }
            })
          } else {
            console.log('error in creating database rows', error)
            connection.release()
            reject(error)
          }
        })
      } else {
        console.log('not connected', { err })
        connection.release()
        reject(err)
      }
    })
  })
  return returnPromise
}
const insertDataintoDB = async (mapData, env, bench_mark_passed) => {
  const returnPromise = new Promise((resolve, reject) => {
    mysqlConnection.getConnection((err, connection) => {
      if (!err) {
        const rowData = convertMapDataToRows(mapData, env, bench_mark_passed)
        console.log(rowData)
        const qry = `INSERT INTO lighthouse.lighthouseData (pagename,url,performance,accessibility,best_practises,seo,time_to_interactive,first_contentful_paint,first_meaningful_paint,largest_contentful_paint, estimated_input_latency, total_blocking_time, first_cpu_idle, network_rtt, network_server_latency,time_to_interactive_score,first_contentful_paint_score,first_meaningful_paint_score,st_contentful_paint_score, estimated_input_latency_score, total_blocking_time_score,  first_cpu_idle_score, network_rtt_score, network_server_latency_score,environment,created,bench_mark_passed) VALUES ?`
        connection.query(qry, [rowData], (insertErr, rows) => {
          if (!insertErr) {
            connection.release()
            resolve('insert done')
          } else {
            console.log('error in inserting rows', { insertErr })
            connection.release()
            reject(insertErr)
          }
        })
      } else {
        console.log('not connected', { err })
        connection.release()
        reject(err)
      }
    })
  })
  return returnPromise
}
const getDataPastData = async (env, pagename) => {
  const returnPromise = new Promise(resolve => {
    mysqlConnection.getConnection((err, connection) => {
      if (!err) {
        console.log('connected')
        const dbQuery = `SELECT * FROM lighthouse.lighthouseData  where environment='${env}' and pagename='${pagename}' and bench_mark_passed=true order by id desc limit 1;`
        connection.query(dbQuery, (error, result) => {
          if (!error) {
            connection.release()
            resolve(convertRowDataObject(result))
          } else {
            console.log('error in getting data from  database', error)
            connection.release()
            resolve(emptyPastData)
          }
        })
      } else {
        console.log('not connected', { err })
        connection.release()
        resolve(emptyPastData)
      }
    })
  })
  return returnPromise
}
export default { insertDataintoDB, getDataPastData, createDatabaseAndTable }
