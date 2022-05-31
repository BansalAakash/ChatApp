const socket = io()

//Elements
const $messageForm = document.querySelector('#messageForm')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')


//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sideBarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})                //Qs imported in chat.html, 'location' is provided by javascript

const autoScroll = () => {
    //New message element
    const $newMessage = $messages.lastElementChild

    //Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)                              //getComputedStyle is provided by JS
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)                    //converts "16px" to 16
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    //Height of messages container
    const containerHeight = $messages.scrollHeight

    //How far I have scrolled?
    const scrollOffSet = $messages.scrollTop + visibleHeight                // scrollTop tells how much distance we've scrolled from top

    if(containerHeight - newMessageHeight <= scrollOffSet){
        $messages.scrollTop = $messages.scrollHeight
    }

}

socket.on('message', (content) => {
    const html = Mustache.render(messageTemplate, {
        username : content.username,
        message : content.text,
        createdAt : moment(content.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('locationMessage', (content)=>{
    const html = Mustache.render(locationMessageTemplate, {
        username : content.username,
        locationLink : content.url,
        createdAt : moment(content.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sideBarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e)=>{
    e.preventDefault()
    //disable button
    $messageFormButton.setAttribute('disabled', 'disabled')
    const message = e.target.elements.message.value
    socket.emit('sendMessage', message, (response)=>{
        //re-enable button, empty input and refocus
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ' '
        $messageFormInput.focus()
        if(response) return console.log(response)
        console.log('Message Delivered!')
    })
})

$sendLocationButton.addEventListener('click', () => {
    if(!navigator.geolocation)                           //checking if the browser supports location
        return alert('Geolocation not supported')

    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, (acknolwedgment) => {
            console.log(acknolwedgment)
            $sendLocationButton.removeAttribute('disabled')
        })
    })
})

socket.emit('join', ({ username, room }), (error)=>{
    if(error){
        alert(error)
        location.href = '/'                                     //will redirect to homepage
    }
})