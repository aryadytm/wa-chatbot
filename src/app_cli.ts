//@ts-check
import * as readline from "readline"
import Chatbot from './chatbot'


const cli = readline.createInterface({ input: process.stdin, output: process.stdout })

// CLI interface for emulating responses
const messenger = {
    sendMessage: (user: string, message: string) => {
        console.log(`# Response: ${message}`)
    }
}

const app = new Chatbot(messenger)


// 1 on 1 chat command
const commandTemplate = {
    hasMedia: false,
    from: "6281219149660@c.us",
    to: "6285161409660@c.us",
    author: "",
    body: "",
    timestamp: 0,
}

const main = () => {
    cli.question("----------\n> Command: ", text => {

        if (text === "/exit") {
            return cli.close()
        }

        const command = { ...commandTemplate }
        command.body = text
        command.timestamp = Math.floor(Date.now() / 1000)

        const resp = app.onMessage(command)

        if ((typeof resp) === "string") {
            console.log(`# Response\n----------\n${resp}`)
        }

        main()
    })
}


main()