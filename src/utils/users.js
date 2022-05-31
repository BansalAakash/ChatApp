const users = []

//addUser
const addUser = ({id, username, room}) => {

    //Validate the data
    if(!username || !room){
        return {
            error : 'Username and room are required!'
        }
    }

    //Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //Check for existing user in the same room
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    //Validate username
    if(existingUser){
        return {
            error: 'Username already in use in this room'
        }
    }

    //store user
    const user = {id, username, room}
    users.push(user)
    return {user}
}

//remove User
removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)                      //returns -1 if match not found
    if(index != -1){
        return users.splice(index, 1)[0]                                         //read splice function of javascript
    }
}

getUser = (id) => {
    return users.find((user) => user.id === id)
}

getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}