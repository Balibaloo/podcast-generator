const fs = require('fs');


let playlistFiles =  fs.readdir("PATH").filter(() => {
    return true
})

console.log(playlistFiles)