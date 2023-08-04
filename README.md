# WhatsApp Chatbot 🤖

## Features

- Retrieve food recipes
- Retrieve food nutritions
- Memory notes
- Store and retrieve images
- Store and retrieve documents
- Send WA messages as bot using Rest API (see endpoints below)

## Commands (Daftar Perintah)

```txt
Fitur Bantuan

bantuan - Menampilkan daftar perintah dalam bahasa Indonesia

Fitur Makanan

info resep <nama makanan> - Mencari resep dari nama makanan yang diberikan
info nutrisi <nama makanan> - Mencari informasi nutrisi dari nama makanan yang diberikan
list makanan - Menampilkan daftar semua makanan

Fitur Galeri

minta gambar <kata kunci> - Mencari gambar sesuai kata kunci
list gambar - Menampilkan daftar semua gambar
simpan gambar <nama gambar> - Menyimpan gambar yang Anda kirim bersamaan dengan perintah
hapus gambar <nama gambar> - Menghapus gambar sesuai nama

Fitur Dokumen

minta dokumen <kata kunci> - Mencari dokumen sesuai kata kunci
list dokumen - Menampilkan daftar semua dokumen
simpan dokumen <nama dokumen> - Menyimpan dokumen yang Anda kirim bersamaan dengan perintah
hapus dokumen <nama dokumen> - Menghapus dokumen sesuai nama

Fitur Catatan

lupa - Tampilkan menu dan daftar catatan
catat - Buat catatan baru

Fitur Notifikasi

buat notifikasi - Tambahkan jadwal notifikasi baru
notifikasi - Tampilkan notifikasi yang sudah dijadwalkan

Fitur AI (Kecerdasan Buatan)

tolong <pesan> - Meminta AI cerdas untuk membantu apapun dari pesan Anda
```

## System Requirements

- OS: Windows 10+ or Ubuntu 20.04+ or Debian Buster+ (Tested on Ubuntu 20.04 LTS)
- At least 4 GB of RAM (Because this program emulates a browser that controls WA through web)
- At least Dual core CPU: AMD or Intel (Tested on AMD Ryzen 7 3700X)
- 64-bit kernel and CPU support for virtualization
- **Compatible with Docker (Mandatory!)**


## Installation

**Installation Steps for Windows (Without Docker):**

Make sure Google Chrome is installed on the server system.

1. Download and Install NodeJS LTS [Click Here](https://nodejs.org/en/download)
2. Download this repository from this GitHub page by clicking green "code" button -> Local -> Download ZIP
3. Extract the zip
4. Open the extracted folder, then open `config.json`, then change the settings as you like
5. In the extracted folder, open CMD (Command Prompt)
6. Run `npm install`
7. Run `npm run start`
8. Scan the WhatsApp QR code in the terminal, then the chatbot is ready to use

**Installation Steps for Windows (Using Docker):**

1. Download Docker Desktop and Install [Click Here](https://www.docker.com/products/docker-desktop/)
2. Open CMD (Command Prompt) then run `git clone https://github.com/aryadytm/wa-chatbot`
3. Open the `wa-chatbot` folder, then open `config.json`, then change the settings as you like
4. Change CMD directory to `wa-chatbot`
5. In the terminal, run `docker-compose up` or `docker compose up`. Then wait until finished
6. Scan the WhatsApp QR code in the terminal, then the chatbot is ready to use

**Installation Steps for Ubuntu (Linux):**

1. Open Terminal then run `git clone https://github.com/aryadytm/wa-chatbot`
2. Open the `wa-chatbot` folder, then open `config.json`, then change the settings as you like
3. Run `cd wa-chatbot`
4. If your OS is **Ubuntu**, install Docker by running `sh install-docker.sh`. Otherwise, look for [Docker Installation Tutorials](https://docs.docker.com/engine/install/)
5. Run `docker-compose up` or `docker compose up` then wait for few minutes
6. Scan the WhatsApp QR code in the terminal, then the chatbot is ready to use


## WA API Endpoints

(GET) Attach WA Account by Scan QR Code
```
https://{domain-name}.loca.lt/link_wa_account
```

(GET) Send WA Message
```
https://{domain-name}.loca.lt/send_wa_message/{WA number}/{Message}
```


## How it Works?

This application emulates a browser instance (such as Google Chrome) inside the **Docker Container** system. 
The browser then opens WhatsApp Web and interacts using the web interface via emulated browser.


## Configuration

You can change the subdomain and admin number in the `config.json`. The admin number is only used to notify if the API is running correctly.


## Development Mode (First Time)

1. Open folder in VSCode devcontainer
2. Run `sh ./setup.sh`
3. Run `npm run start`
4. (Optional) CLI Testing Mode: `npm run cli`
