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

let getAudioFileList = (playlistFileUrl,callback) => {

    fs.readFile(playlistFileUrl,(error,data) => {
        if (!error){
            callback(data.toString().split("\n").slice(0,-1).map(line => {return line.slice(0,-1)}))

        } else {
            console.log(error)
        }
    })
}


let getNameRoot = (directoryPath) => {
    return directoryPath +"\\" +directoryPath.split("\\").slice(-1)[0].slice(0,-4)
}

let formatPath = (path) => {
    return path.replace(" ","\\ ")
}


module.exports.generate = (directoryPath, mainCallback) => {

    let fileNameRoot =  getNameRoot(directoryPath)

    let writeToTxt = (fileList,callback) => {

        let fileName = fileNameRoot + "_playlist.txt"

        console.log("txt filename", fileName)

        fileList = fileList.map((line) => {
            let pat = formatPath(directoryPath+"\\"+line).replace(" ","\ ")
            console.log(pat)
            return `file ${pat}`})
    
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
        
        exec(`ffmpeg -f concat -safe 0 -i '${fileListName}' -c copy '${outputFilename}'`,(error,stdout,stderr) => {
            if (error){
                console.log(error)
            
            } else {
                callback(outputFilename)
            }
    
        })
    }
    
    let generateVideoFile = (audioFileName, callback) => {
        let outputFilename = fileNameRoot + "_video.mp4"
        
        exec(`ffmpeg -loop 1 -i MA.jpg -i "${audioFileName}" -c:a copy -c:v libx264 -shortest ${outputFilename}`,(error,stdout,stderr) => {
            if (error){
                console.log(error)
            
            } else {
                callback(outputFilename)
            }
    
        })
    
    }

    getPlaylistFiles(directoryPath,(files) => {
        playlist = files[0]
        console.log("playlist file : ",playlist)

        getAudioFileList( directoryPath + "\\" + playlist,(files) => {
            
            console.log("audio files : ",files)

            console.log("writing files to txt")
            writeToTxt(files, (fileName) => {
                console.log("done")
    
                console.log("concatenating audio files")
                concatAudioFiles(fileName,(fileName) => {
                    console.log("done")
    
                    // console.log("generating video")
                    // generateVideoFile(fileName,(vidFileName) => {
                    //     console.log("wrote video to",vidFileName)

                    //     mainCallback();
                    // })
                })
            })
        }) 
    })

}