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

let getAudioFileList = (playlistFileName,callback) => {
    let output = []

    let reader = new FileReader();

    reader.addEventListener("load",(event) => {
        console.log(event.target.result)
    })

}

readline.on("line", (line) => {
        
})

getPlaylistFiles(__dirname,(files) => {
    playlist = files[0]

    getAudioFileList(playlist,(files) => {
        console.log(files)
    })
    
})

