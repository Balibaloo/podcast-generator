const fs = require('fs');
const exec = require('child_process').exec

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
            callback(data.toString().split("\n").slice(0,-1).map(line => {return line.slice(0,-1)}))

        } else {
            console.log(error)
        }
    })

}

let getNameRoot = (directoryPath) => {
    //E:\Confer numérisées - MP3 pour baladeur\1974\74_03_30_geneve_MP3
    return directoryPath.split("\\").slice(-1)[0].replace("_MP3","")

}


module.exports.generate = (directoryPath,callback) => {

    let fileNameRoot =  getNameRoot(directoryPath)






    getPlaylistFiles(__dirname,(files) => {
        playlist = files[0]
    
        getAudioFileList(playlist,(files) => {
    
            console.log("writing files to txt")
            writeToTxt(files, (fileName) => {
                console.log("done")
    
                console.log("concatenating audio files")
                concatAudioFiles(fileName,(fileName) => {
                    console.log("done")
    
                    console.log("generating video")
                    generateVideoFile(fileName,(vidFileName) => {
                        console.log("wrote video to",vidFileName)
                    })
                })
            })
        }) 
    })

}