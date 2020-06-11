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
    return directoryPath.slice(0,-4)

}


module.exports.generate = (directoryPath, mainCallback) => {

    let fileNameRoot =  getNameRoot(directoryPath)


    let writeToTxt = (fileList,callback) => {

        let fileName = fileNameRoot + "_playlist.txt"
    
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
    
        let outputFilename = fileNameRoot + "_all.mp3"
    
        exec(`ffmpeg -f concat -safe 0 -i ${fileListName} -c copy ${outputFilename}`,(error,stdout,stderr) => {
            if (error){
                console.log(error)
            
            } else {
                callback(outputFilename)
            }
    
        })
    }
    
    let generateVideoFile = (audioFileName, callback) => {
        let outputFilename = fileNameRoot + "_video.mp4"
    
        exec(`ffmpeg -loop 1 -i MA.jpg -i ${audioFileName} -c:a copy -c:v libx264 -shortest ${outputFilename}`,(error,stdout,stderr) => {
            if (error){
                console.log(error)
            
            } else {
                callback(outputFilename)
            }
    
        })
    
    }

    getPlaylistFiles(directoryPath,(files) => {
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

                        mainCallback();
                    })
                })
            })
        }) 
    })

}