import * as fs from "fs"
import dayjs from 'dayjs'
import localtunnel from "localtunnel"

const engToIndTrans = {
    // interval
    daily: "harian",
    weekly: "mingguan",
    monthly: "bulanan",
    yearly: "tahunan",
    // month
    january: "januari",
    february: "februari",
    march: "maret",
    april: "april",
    may: "mei",
    june: "juni",
    july: "juli",
    august: "agustus",
    september: "september",
    october: "oktober",
    november: "november",
    december: "desember",
    // day
    sunday: "minggu",
    monday: "senin",
    tuesday: "selasa",
    wednesday: "rabu",
    thursday: "kamis",
    friday: "jumat",
    saturday: "sabtu",
}

const currentTimeSecs = () => dayjs(dayjs().format("YYYY-MM-DD HH:mm:ss")).unix()

const appendLog = (pathFile, content) => {
    // Append text to file with format:
    fs.appendFileSync(pathFile, content)
}

const toTitleCase = (str) => {
    // "this is title" -> "This Is Title"
    return str.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    })
}

const englishToIndonesianTime = (dateString) => {
    let dtime = "" + dateString.toLowerCase()
    for (const [key, value] of Object.entries(engToIndTrans)) {
        dtime = dtime.replace(key, value)
    }

    return dtime
}

const indonesianToEnglishTime = (dateString) => {
    let dtime = "" + dateString.toLowerCase()
    for (const [key, value] of Object.entries(engToIndTrans)) {
        dtime = dtime.replace(value, key)
    }

    return dtime
}

const cronFromInterval = (timeString) => {
    // "daily 13:35" ->         "0 35 13 * * *"
    // "weekly sunday 13:35" -> "0 35 13 * * 0"
    // "monthly 1 13:35" ->     "0 35 13 1 * *"
    try {
        const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
        
        let second = 0
        let minute = 0
        let hour = 0
        let dayOfMonth = "*"
        let month = "*"
        let dayOfWeek = "*"
        
        if (timeString.startsWith("daily ")) {
            hour = parseInt(timeString.split(" ")[1].split(":")[0])
            minute = parseInt(timeString.split(" ")[1].split(":")[1])
        } else if (timeString.startsWith("weekly ")) {
            dayOfWeek = days.indexOf(timeString.split(" ")[1])
            hour = parseInt(timeString.split(" ")[2].split(":")[0])
            minute = parseInt(timeString.split(" ")[2].split(":")[1])
        } else if (timeString.startsWith("monthly ")) {
            dayOfMonth = parseInt(timeString.split(" ")[1])
            hour = parseInt(timeString.split(" ")[2].split(":")[0])
            minute = parseInt(timeString.split(" ")[2].split(":")[1])
        } else {
            return null
        }
        
        if (isNaN(minute) || isNaN(second)) return null
        if (second < 0 || second > 60) return null
        if (minute < 0 || minute > 60) return null
        if (hour < 0 || hour > 23) return null
        if (!isNaN(dayOfMonth)) {
            if (dayOfMonth < 0 || dayOfMonth > 31) return null
        }
        if (!isNaN(month)) {
            if (month < 0 || month > 12) return null
        }
        if (!isNaN(dayOfWeek)) {
            if (dayOfWeek < 0 || dayOfWeek > 6) return null
        }
        return `${second} ${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;
    } catch { }
    
    return null
}


const timestampFromDate = (dateString) => {
    // Convert "YYYY/MM/DD HH:MM" to timestamp.
    try {
        const date = dayjs(dateString)
        if (date.isValid()) {
            return date.unix()
        }
    } catch { }
    
    return null
}


const getCurrentDateString = () => {
    return dayjs().format("YYYY-MM-DD HH:mm:ss")
}


function preprocessTarget(targetNum: string): string {
  var target = targetNum + ""
  
  target = target.replace(/[^\x00-\x7F]/g, "");
  target = target.replace(/\D/g, "");
  
  if (target.startsWith("08")) {
    target = "62" + target.slice(1, 20)
  }
  
  target = target + "@c.us"
  return target
}


function preprocessMessage(msg: string): string {
  var message = msg + ""
  
  message = message.replace(/[^\x00-\x7F]/g, "");
  message = message + "\n\n" + "[Pesan ini dikirim secara otomatis oleh sistem]"
  
  return message
}


export {
    currentTimeSecs,
    appendLog,
    cronFromInterval,
    toTitleCase,
    englishToIndonesianTime,
    indonesianToEnglishTime,
    timestampFromDate,
    getCurrentDateString,
    preprocessMessage,
    preprocessTarget,
}