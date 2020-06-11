const fs = require('fs');
const exec = require('child_process').exec

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

    fs.readFile(playlistFileName,(error,data) => {
        if (!error){
            callback(data.toString().split("\n").slice(0,-1).map(line => {return line.slice(3,-1)}))
        }
    })

}

let concatAudioFiles = (fileList, callback) => {
    let outputFilename = fileList[0].split("_").slice(0,-1).join("_") + "_all"

    //`ffmpeg -i 'concat:${fileList.join("|")}' -c copy ${outputFilename}.mp3`

    exec("ping google")
    .on("close",(code) => {
        console.log("close : ",code)
    
    }).on("message",(message) => {
        console.log("message : ",message)
    
    }).on("exit",(code)  => {
        console.log("code : ",code)
    
    }).on("error",(error) => {
        console.log("error : ",error)
    })

}

readline.on("line", (line) => {
        
})

getPlaylistFiles(__dirname,(files) => {
    playlist = files[0]

    getAudioFileList(playlist,(files) => {

        concatAudioFiles(files,() => {


        })
    })
    
})

