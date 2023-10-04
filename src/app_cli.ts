//@ts-check
import * as readline from "readline"
import Chatbot from './chatbot'


const cli = readline.createInterface({ input: process.stdin, output: process.stdout })

// CLI interface for emulating responses
const messenger = {
    sendMessage: (user: string, message: string) => {
        console.log(`[MESSENGER]\n${message}\n`)
    }
}

const app = new Chatbot()
app.initialize(messenger)


// 1 on 1 chat command
const commandTemplate = {
    hasMedia: false,
    from: "6200000000000@c.us",
    to: "6285161409660@c.us",
    author: "",
    body: "",
    timestamp: 0,
    reply: async (resp: string | object) => {        
        if (typeof(resp) === "string")
            console.log(`\n----------\n${resp}`)
        else
            console.log(`\n----------\n{Object ${Object.keys(resp)}}`)
    }
}

const main = () => {
    cli.question("----------\n> Command: ", async text => {
        
        if (text === "/exit") {
            return cli.close()
        }

        const command = { ...commandTemplate }
        command.body = text
        command.timestamp = Math.floor(Date.now() / 1000)

        app.onMessage(command)
        
        await new Promise(resolve => setTimeout(resolve, 500));

        main()
    })
}


main()