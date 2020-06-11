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

let getAudioFileList = (playlistFileUrl) => {
    
    fs.readFile(playlistFileUrl,(error,data) => {
        if (!error){
            // trims \n and trailing \r characters
            return data.toString().split("\n").slice(0,-1).map(line => {return line.slice(0,-1)})

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



module.exports.generate = async (directoryPath, img_path, mainCallback) => {

    let fileNameRoot =  getNameRoot(directoryPath)

    let allInOne = (fileList,playtime ,callback) => {
        
        let outputFilename = fileNameRoot + "_video.mp4"
        let complexFilterArguments = fileList.map((val,index) => {return `[${index+1}:a]`}).join('')

        console.log("generating video", fileNameRoot)

        exec(`ffmpeg -loop 1 -framerate 1 \
        -i ${img_path} \
        -i ${fileList.map(line => `"${line}"`).join(" -i ")} \
        -filter_complex "[0]scale='iw-mod(iw,2)':'ih-mod(ih,2)',format=yuv420p[v];${complexFilterArguments}concat=n=${fileList.length}:v=0:a=1[a]" \
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


    let files = await getPlaylistFiles(directoryPath) 
    playlist = files[0]
    console.log("playlist file : ",playlist)

    let audioFiles = await getAudioFileList( directoryPath + "\\" + playlist)
    console.log("audio files : ",audioFiles)
    audioFiles = audioFiles.map(url => {
        return directoryPath+"\\"+url
    })

    let totaltPlaytime = await getTotalPlaytime(audioFiles)
    console.log("calculated total playtime ",totaltPlaytime)
        
    allInOne(files,playtime,mainCallback)

}