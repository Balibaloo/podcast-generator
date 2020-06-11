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
            callback(data.toString().split("\n").slice(0,-1).map(line => {return line.slice(0,-1) }))
        }
    })

}

let writeToTxt = (fileList,callback) => {

    let fileName = fileList[0].split("_").slice(0,-1).join("_") + "_playlist.txt"

    fileList = fileList.map((line) => {return `file '${line}'`})

    fs.writeFile(fileName,fileList.join("\n") ,(error) => {
        if (!error){
            callback(fileName)

        } else {
            console.log(error)
        }
    })

}

let concatAudioFiles = (fileListName, callback) => {

    let outputFilename = fileListName.split("_").slice(0,-1).join("_") + "_all"

    exec(`ffmpeg -f concat -safe 0 -i ${fileListName} -c copy ${outputFilename}.mp3`,(error,stdout,stderr) => {
        if (error){
            console.log(error)
        
        } else {
            callback(outputFilename)
        }

    })
}

let generateVideoFile = (audioFileName, callback) => {

    //ffmpeg -loop 1 -i image.jpg -i audio.mp3 -c:a copy -c:v libx264 -shortest out.mp4

    exec(`ffmpeg -loop 1 -i MA.jpg -i ${audioFileName} -c:a copy -c:v libx264 -shortest out.mp4`,(error,stdout,stderr) => {
        if (error){
            console.log(error)
        
        } else {
            callback()
        }

    })

}

readline.on("line", (line) => {
        
})


getPlaylistFiles(__dirname,(files) => {
    playlist = files[0]

    getAudioFileList(playlist,(files) => {

        console.log("writing files to txt")
        writeToTxt(files, (fileName) => {
            console.log("done")

            console.log("concatenating files")
            concatAudioFiles(fileName,() => {
                console.log("done")


            })
        })
    }) 
})

