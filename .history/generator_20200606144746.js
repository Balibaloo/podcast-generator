const fs = require('fs');

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});


let getPlaylistFiles = (path,callback) => {
    fs.readdir(path,(error,files) => {
        
        if (!error){
            callback(files.filter((file) => {
                return file.endsWith(".m3u")
            }))
        } else {
            console.log(error)
        }

    })
}

readline.on("line", (line) => {
        
})

getPlaylistFiles(__dirname,(files) => {
    playlist = files[0]

    fs.readFile(playlist, function (error, data) {
        if (!error) {
            console.log(data.toString())
           
        } else{
            return console.error(error);
        }
        
     });
})

