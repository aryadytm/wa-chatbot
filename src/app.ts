//@ts-check
import express from 'express'
import cors from 'cors';

import * as utils from './utils'
import WAClient from './whatsapp_client'
import Chatbot from './chatbot'

const helmet = require('helmet');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const api_port = 40001
const api = express();

const wa = new WAClient();
const chatbot = new Chatbot()

wa.initialize(chatbot)
chatbot.initialize(wa.client)


/**
* Code for WA API using Express.js
*/

// Create helper functions
api.use(helmet());
api.use(cors());
api.use(morgan('combined'));
api.use(bodyParser.json());


api.get('/', (req, res) => {
  res.type('json');
  res.send(`Good news, API is running! If you haven't linked your WA account, please go to ${wa.getUrl()}/link_wa_account`);
});


api.get('/link_wa_account', (req, res) => {
  
  var resp = wa.qrImageStr
  
  if (!wa.isConnected) {
    res.type('json')
  }
  
  return res.send(resp)
})


api.get('/reset_wa_account', (req, res) => {
  
  wa.qrImageStr = "Unlinking your account... Please refresh this page after 1 minute."
  res.redirect("/link_wa_account")
  
  new Promise(resolve => setTimeout(resolve, 8000)).then(() => {
    wa.onResetAccount()
  })
  
}) 


api.get('/send_wa_message/:targetNum/:message', (req, res) => {
  
  res.type('json');
  
  if (!wa.isConnected) {
    return res.status(400).send(`You have not linked any account. Please link it first.`)
  }
  
  if (String(req.get('user-agent')).toLowerCase().includes("whatsapp")) {
    return res.status(400).send(`Not allowed`)
  }
  
  const targetNum = utils.preprocessTarget(req.params.targetNum)
  const message = utils.preprocessMessage(req.params.message)
  
  if (targetNum.length <= 5 || targetNum.length > 20) {
    return res.status(400).send(`Gagal kirim pesan karena nomor target invalid.`)
  }
  
  if (message.length > 1000) {
    return res.status(400).send(`Gagal kirim pesan karena jumlah karakter melebihi 1000`)
  }
  
  try {
    wa.client.sendMessage(targetNum, message).catch().finally()
    return res.send(`Berhasil kirim pesan ke ${targetNum}\n-----------\nIsi Pesan: ${message}`)
  } catch (err) {
    return res.status(500).send(`Gagal kirim pesan: ${err.message}`)
  }
  
});


api.listen(api_port, () =>
  console.log(`WA API listening on port ${api_port}!`),
);