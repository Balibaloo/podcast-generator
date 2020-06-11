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
            callback(data.toString().split("\n").slice(0,-1).map(line => {return __dirname + line.slice(0,-1) }))
        }
    })

}

let concatAudioFiles = (fileList, callback) => {
    let outputFilename = fileList[0].split("_").slice(0,-1).join("_") + "_all"

    //`ffmpeg -f concat -safe 0 -i mylist.txt -c copy ${outputFilename}.mp3`

    exec(`ffmpeg -i 'concat:${fileList.join("|")}' -c copy ${outputFilename}.mp3`,(error,stdout,stderr) => {
        if (error){
            console.log(error)
        
        } else {
            console.log("out : ",stdout)
            console.log("err : ",stderr)
            
        }

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

