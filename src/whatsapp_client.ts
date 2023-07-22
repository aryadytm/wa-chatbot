//@ts-check
import qrcode from 'qrcode-terminal'
import wa from 'whatsapp-web.js'
import dayjs from 'dayjs'
import * as fs from 'fs'
import * as utils from './utils'
import { expectCt } from 'helmet'
import localtunnel from 'localtunnel'
import AppWrapper from './appwrapper'


type WAConfig = {
  admin_number: string
  public_domain_name: string
}


class WAClient {
  client: wa.Client
  isConnected: boolean
  qrImageStr: string
  config: WAConfig
  tunnel: localtunnel.Tunnel
  
  initialize(chatbot: AppWrapper) {
    console.log(`[${utils.getCurrentDateString()}] Initializing WA client...`)
    
    // Use localtunnel to serve public
    new Promise(resolve => setTimeout(resolve, 10000)).then(() => {
      (async () => {
        const tunnel = await localtunnel({
          subdomain: this.config.public_domain_name,
          port: 40001,
        });
        
        console.log("Public URL has created.")
        console.log(tunnel.url)
        
        tunnel.on('close', () => {
          console.log("Public URL has closed.")
        });
        
        this.tunnel = tunnel
      })();
    })
    
    // Initialize WA
    this.isConnected = false
    this.qrImageStr = "Initializing API. Please keep refreshing this page!"
    this.config = JSON.parse(fs.readFileSync('config.json'))
    
    this.client = new wa.Client({
      authStrategy: new wa.LocalAuth({
        clientId: `api-account`,
        dataPath: `wwebjs_auth`
      }),
      puppeteer: {
        executablePath: "/usr/bin/google-chrome-stable",
        headless: true,
        handleSIGINT: false,
        args: [
          "--no-sandbox",
        ],
      },
    })

    this.client.on('qr', qr => {
      this.onClientQr(qr)
    })

    this.client.on('ready', () => {
      this.onClientReady()
    })
    
    this.client.on('disconnected', () => {
      this.onClientDisconnected()
    })
    
    this.client.on('message', msg => {
      this.onClientMessage(msg, chatbot)
    })

    // Stop gracefully to save WA session
    process.on("SIGINT", async () => {
      console.log("\n");
      console.log("(SIGINT) Shutting down...");
      
      await this.client.destroy();
      
      if (this.tunnel) {
        this.tunnel.close()
      }
      
      console.log("(SIGINT) Shut down success...");
      process.exit(0);
    })
    
    this.client.initialize()
  }
  
  onClientMessage(msg: wa.Message, chatbot: AppWrapper) {
    let resp = undefined
    resp = chatbot.handleCommand(msg)
    
    if ((typeof resp) === "string") {
      msg.reply(resp)
    } else {
      msg.reply(`Error: Message type is not string (${resp})`)
    }
    
    // Logging
    const date = new Date()
    const time = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
    const log = (
      `=============================` + "\n" +
      `time: ${time}` + "\n" +
      `from: ${msg.from}` + "\n" +
      `author: ${msg.author}` + "\n" +
      `to: ${msg.to}` + "\n" +
      `mediaKey: ${msg.mediaKey}` + "\n" +
      `-----------body--------------` + "\n" +
      `${msg.body}` + "\n" +
      `-----------response----------` + "\n" +
      `${resp}` + "\n" +
      ``
    )
    utils.appendLog("data/whatsapp.log", log)
  }
  
  getUrl() {
    return `https://${this.config.public_domain_name}.loca.lt`
  }
  
  onClientReady() {
    console.log(`[${utils.getCurrentDateString()}] Notifier client is ready!`)
    
    const clickHere = `<a href="/reset_wa_account">Click Here</a>`
    
    this.qrImageStr = `Account has been linked. Want to change to a different account? ${clickHere}.`;
    this.client.sendMessage(utils.preprocessTarget(this.config.admin_number), `Sistem API WA berhasil dinyalakan dengan URL: ${this.getUrl()}`)
    this.isConnected = true
  }
  
  onClientQr(rawQr: string) {
    qrcode.generate(rawQr, { small: true }, (_qrImageStr) => {
      this.qrImageStr = (
        "Scan this QR to link your WA account.\n" +
        "Please refresh the page after link account.\n\n" +
        "NOTE: This QR will expire in 30 seconds. Please refresh page if it happened. \n\n" + _qrImageStr
      );
      console.log(_qrImageStr)
      console.log(`Please scan the QR code. You can also go to ${this.getUrl()}/link_wa_account to scan from web.`)
    })
  }
  
  onClientDisconnected() {
    const clickHere = `<a href="/reset_wa_account">Click Here</a>`
    this.isConnected = false
    this.qrImageStr = `Account disconnected. Please ${clickHere} to relink your account.`
  }
  
  onResetAccount() {
    
    if (!this.isConnected) {
      return console.log("No client to reset");
    }
    
    console.log("Unlink Account...")
    
    // this.client.removeAllListeners()
    // NOTE: Expect this to reset along with Docker
    this.client.logout()
      .finally(() => {
        console.log("Closed!")
        this.tunnel.close()
        process.exit(0)
      })

    this.isConnected = false
  }
  
}

export default WAClient