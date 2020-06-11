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
            console.log(data.toString())

            // trims \n and trailing \r characters
            callback(data.toString().split("\n").slice(0,-1).map(line => {return line.slice(0,-1)}))

        } else {
            console.log(error)
        }
    })
}

let getTotalPlaytime = (files,callback) => {

    let allPromi = []

    files.forEach((url) => {
        allPromi.push(getSinglePlaytime(url))
    })

    Promise.all(allPromi).then((results) => {
        console.log("RESULTS : " ,results)
        
    }).catch(error => {
        console.log(error)
    })
    

}

let getSinglePlaytime = (url) => new Promise((resolve,reject) => {

    let file = new File("filename.mp3");
    baseFileFormat = AudioSystem.getAudioFileFormat(file);
    Map properties = baseFileFormat.properties();
    Long duration = (Long) properties.get("duration");

    // fs.readFile(url, (err, data) => {
    //     if (!err){
    //         mutag.fetch(data).then((tags) => {
    //         console.log(tags);
    //         resolve(tags)
    //         });     
        
    //     } else {
    //         reject(err)
    //     }
        
    //   });

})

let getNameRoot = (directoryPath) => {
    return directoryPath +"\\" +directoryPath.split("\\").slice(-1)[0].slice(0,-4)
}



module.exports.generate = (directoryPath, img_path, mainCallback) => {

    let fileNameRoot =  getNameRoot(directoryPath)

    let writeToTxt = (fileList,callback) => {

        let fileName = fileNameRoot + "_playlist.txt"

        console.log("txt filename", fileName)

        fileList = fileList.map((line) => {
            let pat = (directoryPath+"\\"+line).replace(" ","\ ") 
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
        
        exec(`ffmpeg -f concat -safe 0 -i " ${fileListName} " -c copy " ${outputFilename} "`,(error,stdout,stderr) => {
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

    let allInOne = (fileList ,callback) => {
        
        let outputFilename = fileNameRoot + "_video.mp4"
        
        let randomBullshitArguments = fileList.map((val,index) => {return `[${index+1}:a]`}).join('')

        fileStrings = files.map((line) => {
            console.log(path)
            return `"${path}"`})

        //"concat:input1.ts|input2.ts|input3.ts"
        //`ffmpeg -loop 1 -framerate 1 -i MA.jpg -i ${fileList.join(" -i ")} -filter_complex '${randomBullshitArguments}concat=n=${fileList.length}:v=1:a=1' -tune stillimage -shortest ${outputFilename}`
        //`ffmpeg -loop 1 -i MA.jpg -i "concat:${fileList.join("|")}" -c:a copy -c:v libx264 -shortest ${outputFilename}`

        console.log("generating video")
        exec(`ffmpeg -loop 1 -framerate 1 \
        -i ${img_path} \
        -i ${fileStrings.join(" -i ")} \
        -filter_complex "[0]scale='iw-mod(iw,2)':'ih-mod(ih,2)',format=yuv420p[v];${randomBullshitArguments}concat=n=${fileStrings.length}:v=0:a=1[a]" \
        -map "[v]" -r 15 -map "[a]" \
        -tune stillimage -t 5 -movflags +faststart ${outputFilename}`,(error,stdout,stderr) => {
            console.log(stdout)
            
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

            files = files.map(url => {
                return directoryPath+"\\"+url
            })

            getTotalPlaytime(files, (playtime) => {
                
                //allInOne(files,mainCallback)
                
            } )
            
         

            // console.log("writing files to txt")
            // writeToTxt(files, (fileName) => {
            //     console.log("done")
    
            //     console.log("concatenating audio files")
            //     concatAudioFiles(fileName,(fileName) => {
            //         console.log("done")
    
            //         // console.log("generating video")
            //         // generateVideoFile(fileName,(vidFileName) => {
            //         //     console.log("wrote video to",vidFileName)

            //         //     mainCallback();
            //         // })
            //     })
            // })
        }) 
    })

}