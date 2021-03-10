//Connect to server
const socket = io()

//Elements
const $chatForm = document.querySelector('.chat__form')
const $chatInput = $chatForm.querySelector('input')
const $chatSendBtn = $chatForm.querySelector('button')
const $chatMessages = document.querySelector('.chat__messages')

//Templates
const messageTemplate = document.querySelector('#message__template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar__template').innerHTML

//Options | Parameters | Query
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
})

//Functions
const autoscroll = () => {
    // last Message element
    const $lastMessage = $chatMessages.lastElementChild

    // Height of last message
    const lastMessageStyles = getComputedStyle($lastMessage)
    const lastMessageMargin = parseInt(lastMessageStyles.marginBottom)
    const lastMessageHeight = $lastMessage.offsetHeight + lastMessageMargin

    //Visible Height
    const visibleHeight = $chatMessages.offsetHeight

    //Height of messages container
    const containerHeight = $chatMessages.scrollHeight

    //How far have I scrolled?
    const scrollOffset = $chatMessages.scrollTop + visibleHeight

    //If we were at the bottom of the message
    if (containerHeight - lastMessageHeight <= scrollOffset) {
        $chatMessages.scrollTop = $chatMessages.scrollHeight
    }
}

//Server => Browser
socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})

socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a'),
    })
    $chatMessages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users,
    })
    document.querySelector('.chat__sidebar').innerHTML = html
})

//Browser Events => Server
$chatForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $chatSendBtn.setAttribute('disabled', 'disabled')
    $chatSendBtn.classList.add('disabled')

    const message = $chatInput.value

    //Send off to server
    socket.emit('sendMessage', message, (err) => {
        $chatSendBtn.classList.remove('disabled')
        $chatInput.value = ''
        $chatInput.focus()
        $chatSendBtn.removeAttribute('disabled')
        if (err) {
            return console.log(err)
        }
    })
})
