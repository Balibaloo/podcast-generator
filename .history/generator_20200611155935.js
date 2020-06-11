const fs = require('fs');
const exec = require('child_process').exec
const mm = require('music-metadata');

let getPlaylistFiles = (path) => {

    fs.readdir(path,(error,files) => {
        if (!error){
            return files.filter((file) => {
                return file.endsWith(".m3u")
            })
        } else {
            console.log(error)
        }

    })
}

let getAudioFiles = (playlistFileUrl) => {
    
    fs.readFile(playlistFileUrl,(error,data) => {
        if (!error){
            // trims \n and trailing \r characters
            return data.toString().split("\n").slice(0,-1).map(line => {return line.slice(0,-1)})

        } else {
            console.log(error)
        }
    })
}

let getTotalAudioDuration = (files,callback) => {

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

let generateVideo = (fileList,playtime,imagePath) => {

    let fileNameRoot =  getNameRoot(directoryPath)
    let outputFilename = fileNameRoot + "_video.mp4"
    let complexFilterArguments = fileList.map((val,index) => {return `[${index+1}:a]`}).join('')

    console.log("generating video", fileNameRoot)

    exec(`ffmpeg -loop 1 -framerate 1 \
    -i ${imagePath} \
    -i ${fileList.map(line => `"${line}"`).join(" -i ")} \
    -filter_complex "[0]scale='iw-mod(iw,2)':'ih-mod(ih,2)',format=yuv420p[v];${complexFilterArguments}concat=n=${fileList.length}:v=0:a=1[a]" \
    -map "[v]" -r 15 -map "[a]" \
    -tune stillimage -t ${playtime} -movflags +faststart ${outputFilename}`,(error,stdout,stderr) => {
        console.log(stdout)
        
        if (error){
            console.log(error)
        
        } else {
            return outputFilename
        }

    })
}


module.exports.generate = async (directoryUrl, foregroundImgUrl, mainCallback) => {

    let playlistFileName = await getPlaylistFiles(directoryUrl)[0]
    console.log("playlist file : ",playlistFileName)

    let audioFiles = await getAudioFiles( directoryUrl + "\\" + playlistFileName)
    console.log("audio files : ",audioFiles)

    // prepend paths to filenames
    audioFiles = audioFiles.map(fileUrl => {
        return directoryUrl+"\\"+fileUrl
    })

    let totalAudioDuration = await getTotalAudioDuration(audioFiles)
    console.log("calculated total playtime ", totalAudioDuration)
        
    let generatedPath = await generateVideo(audioFiles, totalAudioDuration, foregroundImgUrl)
    mainCallback(generatedPath)

}