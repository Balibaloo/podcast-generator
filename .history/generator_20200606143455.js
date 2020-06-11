const fs = require('fs');


let getPlaylistFiles = (path) => {
    return fs.readdir(path).filter(() => {
        return true
    })
}

console.log(playlistFiles)


const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});


readline.on("line",(line) => {

})