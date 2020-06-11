const fs = require('fs');

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});


let getPlaylistFiles = (path,callback) => {
    fs.readdir(path,(error,files) => {
        
        if (!error){
            callback(files.filter(() => {
                return true
            }))
        } else {
            console.log(error)
        }

    })
}

readline.on("line", (line) => {
    console.log(getPlaylistFiles("E:\Confer numérisées - MP3 pour baladeur\1974\74_11_21_paris_MP3"))
})

// getPlaylistFiles("E:\Confer numérisées - MP3 pour baladeur\1974\74_11_21_paris_MP3",(files) => {
//     console.log(files);
// })

console.log("E:\Confer numérisées - MP3 pour baladeur\1974\74_11_21_paris_MP3".replace("\\","\\\\"))