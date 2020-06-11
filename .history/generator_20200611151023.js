const fs = require('fs');
const exec = require('child_process').exec

const mm = require('music-metadata');

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
        
        // get sum of play time rounded to nearest second
        callback(Math.ceil(results.reduce((accum,val) => {return accum + val})))
        
    }).catch(error => {
        console.log(error)
    })
    

}

let getSinglePlaytime = (url) => new Promise((resolve,reject) => {

    mm.parseFile(url)
  .then( metadata => {
    resolve(metadata.format.duration);
  })
  .catch( err => {
    console.error(err.message);
  });
    

    // fs.readFile(url, (err, data) => {
    //     if (!err){
    //         console.log(data.byteLength)
            
    //         musicMetadata.parseBlob(data).then(metadata => {
    //             console.log(metadata)
    //             // metadata has all the metadata found in the blob or file
    //           });
        
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


    let allInOne = (fileList,playtime ,callback) => {
        
        let outputFilename = fileNameRoot + "_video.mp4"
        
        let randomBullshitArguments = fileList.map((val,index) => {return `[${index+1}:a]`}).join('')

        fileStrings = fileList.map(line => `"${line}"`)


        console.log("generating video")
        exec(`ffmpeg -loop 1 -framerate 1 \
        -i ${img_path} \
        -i ${fileStrings.join(" -i ")} \
        -filter_complex "[0]scale='iw-mod(iw,2)':'ih-mod(ih,2)',format=yuv420p[v];${randomBullshitArguments}concat=n=${fileStrings.length}:v=0:a=1[a]" \
        -map "[v]" -r 15 -map "[a]" \
        -tune stillimage -t ${playtime} -movflags +faststart ${outputFilename}`,(error,stdout,stderr) => {
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

                console.log("playtime ",playtime)
                
                allInOne(files,playtime,mainCallback)
                
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