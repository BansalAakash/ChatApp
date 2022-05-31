const path = require('path')
const port = process.env.PORT
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

console.clear()

const publicDirectoryPath = path.join(__dirname, '../public')
app.use(express.static(publicDirectoryPath))

const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')

//socket.emit emits to the client that initiated that the socket is connected to
//io.emit emits to all the connected clients
//socket.broadcast emits to everyone except the client that the socket is connected to
//io.to(room).emit emits an event to everyone in a particular room
//socket.broadcast.to(room).emit similar to socket.broadcast but only sends message to a particular room

io.on('connection', (socket) => {
    console.log('New Websocket connection')
    
    socket.on('join', ({username, room}, callback) => {
        const {error, user} = addUser({
            id: socket.id,                                    //socket.id is provided by socket.io
            username,
            room
        })
        if(error){
            return callback(error)
        }
        socket.join(user.room)                                   //socket.join can only be used on server and is given by socket library for joining rooms
        socket.emit('message', generateMessage("Admin", 'Welcome'))
        socket.broadcast.to(user.room).emit('message', generateMessage("Admin", `${user.username} has joined!`))
        io.to(user.room).emit('roomData',{
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()                                          //returning empty callback to signigy that no error
    })

    socket.on('sendMessage', (content, callback) => {
        const filter = new Filter()
        if(filter.isProfane(content))
            return callback('Profanity')
        console.log(content)
        const user = getUser(socket.id)
        io.to(user.room).emit('message', generateMessage(user.username, content))
        callback()                                              //callback helps for acknowlegding
    })

    socket.on('sendLocation', ({latitude, longitude}, callback) => {
        // socket.broadcast.emit('message', `A new user has joined from ${latitude}, ${longitude}`)
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${latitude},${longitude}`))
        callback('Location shared!')
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        
        if(user){
            io.to(user.room).emit('message', generateMessage("Admin", `${user.username} has left`))
            io.to(user.room).emit('roomData',{
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})



server.listen(port, ()=>{
    console.log(`Listening on port ${port}`)
})