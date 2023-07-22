//@ts-check
import {CronJob} from "cron";
import cronParser from "cron-parser";
import * as fs from "fs"
import dayjs from 'dayjs'

import * as utils from "../utils"
import Feature from "./feature"


class Notification extends Feature {
    messenger: any
    path_data: string
    timezone: string
    data: object
    maxEntriesPerAuthor: number
    crons: Array<any>
    
    constructor(messenger) {
        super()
        this.messenger = messenger

        this.contexts = {
            IDLE: 0,
            SHOW_SCHEDULE: 11,
            CREATE_TIME: 21,
            CREATE_CONTENT: 22,
            DELETE: 31,
        }

        this.path_data = 'data/notification.json'
        this.timezone = 'Asia/Jakarta'
        this.data = JSON.parse(fs.readFileSync(this.path_data))
        this.maxEntriesPerAuthor = 100
        this.crons = []
        this._startAllCrons()

        // Cron job to check specific date schedules
        new CronJob("0 * * * * *", () => {
            this._checkSpecificDateSchedules()
        }, null, true, this.timezone)
    }

    _checkSpecificDateSchedules() {
        for (const [user, cronList] of Object.entries(this.data)) {
            for (const cr of cronList) {

                if (isNaN(cr.cron) || cr.cron.split(" ").length === 6) {
                    continue
                }
                const currentTime = utils.currentTimeSecs()
                const targetTime = parseInt(cr.cron)

                if (currentTime > targetTime) {
                    // Send WhatsApp message
                    let msg = cr.content + `\n\nNotifikasi [${utils.toTitleCase(cr.timeString)}]`
                    this.messenger.sendMessage(user, msg)
                    // Delete then commit
                    this.data[user].splice(this.data[user].indexOf(cr), 1)
                    this._commit()
                }
            }
        }
    }

    _startAllCrons() {
        for (const [user, cronList] of Object.entries(this.data)) {
            for (const cr of cronList) {

                if (cr.cron === undefined || cr.cron === null || cr.cron.split(" ").length !== 6) {
                    continue
                }

                const cronObj = new CronJob(cr.cron, () => {
                    // Send WhatsApp message
                    let msg = cr.content + `\n\nNotifikasi [${utils.toTitleCase(cr.timeString)}]`
                    this.messenger.sendMessage(user, msg)
                }, null, true, this.timezone)

                // Add to crons to make it stoppable
                this.crons.push(cronObj)
            }
        }
    }

    _stopAllCrons() {
        for (let cr of this.crons) {
            cr.stop()
        }
        this.crons = []
    }

    _refreshCrons() {
        this._stopAllCrons()
        this._startAllCrons()
    }

    _commit() {
        fs.writeFileSync(this.path_data, JSON.stringify(this.data))
        this._refreshCrons()
    }

    _insert(from, timeString, cron, content) {
        if (!this.data.hasOwnProperty(from)) {
            this.data[from] = []
        }
        this.data[from].push({
            id: this.data[from].length,
            chatId: from,
            timeString: timeString,
            cron: cron,
            content: content,
        })
        this._commit()
    } 

    _delete(from, id) {
        if (!this.data.hasOwnProperty(from)) {
            return
        }
        if (this.data[from].length === 0) {
            return
        }
        for (let sched of this.data[from]) {
            if (sched.id == id) {
                this.data[from].splice(this.data[from].indexOf(sched), 1)
                break
            }
        }
        // reorder the IDs
        let i = 0
        for (let sched of this.data[from]) {
            sched.id = i++;
        }
        this._commit()
    }
 
    _getSortedSchedules(from) {
        // Sort crons until next schedule
        // Then use parseExpression to get next schedule time
        const sortedScheduleAsc = this.data[from].sort((a, b) => {
            const left = a.cron
            const right = b.cron
            if (isNaN(left) && isNaN(right)) {
                return cronParser.parseExpression(left).next().getTime() - cronParser.parseExpression(right).next().getTime()
            } else if (isNaN(left) && !isNaN(right)) {
                return cronParser.parseExpression(left).next().getTime() - (parseInt(right) * 1000)
            } else if (!isNaN(left) && isNaN(right)) {
                return (parseInt(left) * 1000) - cronParser.parseExpression(right).next().getTime()
            } else {
                return (parseInt(left) * 1000) - (parseInt(right) * 1000)
            }
        })
        return sortedScheduleAsc
    }
    
    /**
     * 
     * @param {string} from 
     * @returns {string}
     */
    _readSchedules(from) {
        if (!this.data.hasOwnProperty(from)) {
            return "[ Jadwal notifikasi kosong ]\n"
        }
        if (this.data[from].length === 0) {
            return "[ Jadwal notifikasi kosong ]\n"
        }

        let titles = ""
        
        const data = this.data[from].sort((a, b) => {
            return a.id - b.id
        })

        for (let i = 0; i < data.length; i++) {
            let timeString = "" + data[i].timeString
            timeString = utils.toTitleCase(timeString)

            let title = "" + data[i].content
            title = title.replace("\n", "")
            if (title.length > 25) {
                title = title.slice(0, 26) + " ..."
            }

            titles += `${data[i].id + 1}) [${timeString}]\n${title}\n\n`
        }

        // Sort crons until next schedule
        // Then use parseExpression to get next schedule time
        const nearestSchedule = this._getSortedSchedules(from)[0]

        let nearestScheduleTitle = "" + nearestSchedule.content.replace("\n", "")
        if (nearestScheduleTitle.length > 25) {
            nearestScheduleTitle = nearestScheduleTitle.slice(0, 26) + " ..."
        }

        let nextScheduleTimestamp = nearestSchedule.cron
        if (isNaN(nextScheduleTimestamp)) {
            nextScheduleTimestamp = cronParser.parseExpression(nearestSchedule.cron).next().getTime()
        } else {
            nextScheduleTimestamp = parseInt(nextScheduleTimestamp) * 1000
        }
        // Convert nextScheduleTimestamp to "Day, YYYY-MM-DD HH:MM" using dayjs
        const nextSchedule = dayjs(nextScheduleTimestamp).format("dddd, YYYY-MM-DD HH:mm")

        return (
            titles + `Waktu notifikasi berikutnya:\n${utils.toTitleCase(utils.englishToIndonesianTime(nextSchedule))}\n` +
            `[${utils.toTitleCase(nearestSchedule.timeString)}] ` +
            `${nearestScheduleTitle}\n`
        )
    }
    
    _handleTimeString(timeString) {
        const englishTimeString = utils.indonesianToEnglishTime(timeString)
        const cronFromInterval = utils.cronFromInterval(englishTimeString)

        if (cronFromInterval !== null) {
            return cronFromInterval
        }
        // Check for a specific time,
        const targetTimestamp = utils.timestampFromDate(englishTimeString)
        if (targetTimestamp !== null) {
            return targetTimestamp
        }

        return null
    }

    help() {
        return (
            "Fitur Notifikasi\n\n" +
            "*notifikasi* - Tampilkan notifikasi yang sudah dijadwalkan\n" +
            "*schedule* - Tambahkan jadwal notifikasi baru\n" +
            ""
        )
    }

    shouldAttach(command, state) {
        const inText = command.body.toLowerCase()

        if (inText === "notifikasi") return true
        if (inText === "schedule") return true

        return false
    }

    onReceiveMessage(command, state) {
        const msg = command.body
        const cmd = (msg + "").toLowerCase()
        const sender = command.from

        if (cmd === "keluar" && state.context !== this.contexts.IDLE) {
            state.detach()
            return "Berhasil keluar. Sekarang kamu dapat menjalankan perintah lain."
        }

        if (cmd === "notifikasi" && state.context === this.contexts.IDLE) {
            state.setContext(this.contexts.SHOW_SCHEDULE)
            
            return (
                "Ini adalah jadwal notifikasi kamu:\n\n" +
                this._readSchedules(sender) + "\n" +
                "Balas *hapus <nomor>* untuk hapus notifikasi.\n" +
                "Balas *schedule* untuk tambah notifikasi.\n" +
                "Balas *keluar* untuk keluar dari menu.\n"
            )
        }

        else if (cmd.startsWith("hapus ") && state.context === this.contexts.SHOW_SCHEDULE) {
            const num = cmd.replace("hapus ", "")
            
            if (!isNaN(num)) {
                const index = parseInt(num) - 1
                if (index >= 0 && index < this.data[sender].length) {
                    this._delete(sender, index)
                    state.detach()
                    return `Notifikasi (${num}) berhasil dihapus.`
                } else {
                    return `Tidak dapat menemukan nomor (${num}).`
                }
            }
        }

        else if (cmd === "schedule" &&
            (state.context === this.contexts.IDLE || state.context === this.contexts.SHOW_SCHEDULE))
        {
            if (this.data.hasOwnProperty(sender) && this.data[sender].length >= this.maxEntriesPerAuthor) {
                state.detach()
                return `Telah mencapai maksimum ${this.maxEntriesPerAuthor} notifikasi.`
            }
            state.setContext(this.contexts.CREATE_TIME)
            return (
                "Ketik interval yang diinginkan:" + "\n\n" +
                "*Harian <jam:menit>*\nContoh: Harian 13:30" + "\n\n" +
                "*Mingguan <nama hari> <jam:menit>*\nContoh: Mingguan rabu 06:00" + "\n\n" +
                "*Bulanan <tanggal> <jam:menit>*\nContoh: Bulanan 12 09:00" + "\n\n" +
                "Atau notifikasi dengan waktu spesifik:\n(Target waktu harus di masa depan)" + "\n\n" +
                "*<tahun-bulan-tanggal jam:menit>*" + "\n" +
                "Contoh: 2023-04-12 15:00" + "\n\n" +
                "CATATAN: Format jam yang digunakan adalah *24 jam*. Misalnya jam 13:00 artinya jam 1 siang." +
                ""
            )
        }

        else if (state.context === this.contexts.CREATE_TIME) {
            const cron = this._handleTimeString(msg)

            if (cron === null) {
                return "Format waktu tidak tepat."
            }

            state.temp.timeString = "" + msg
            state.temp.cron = "" + cron
            
            state.setContext(this.contexts.CREATE_CONTENT)
            return `Sekarang ketik tulisan yang akan dijadikan notifikasi.`
        }

        else if (state.context === this.contexts.CREATE_CONTENT) {
            if (msg.length < 10) {
                return "Minimum tulisan 10 karakter"
            }
            // TODO: Handle image, and caption!
            this._insert(sender, state.temp.timeString, state.temp.cron, msg)
            state.detach()
            return "Notifikasi berhasil ditambahkan. Untuk lihat jadwalnya, ketik *notifikasi*"
        }
    }
}

export default Notification