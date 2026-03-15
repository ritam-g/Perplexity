import { io } from 'socket.io-client'

export function initializedSocketConnection() {
    const soket=io('http://localhost:5000',{
        withCredentials:true
    })

    soket.on("connect",()=>{
        console.log("client is connected with server ");
    })

}