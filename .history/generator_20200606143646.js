const fs = require('fs');

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});


let getPlaylistFiles = (path) => {
    return fs.readdir(path).filter(() => {
        return true
    })
}

readline.on("line", (line) => {
    console.log(getPlaylistFiles("E:\Confer numérisées - MP3 pour baladeur\1974\74_11_21_paris_MP3"))
})

console.log(getPlaylistFiles("E:\Confer numérisées - MP3 pour baladeur\1974\74_11_21_paris_MP3"))