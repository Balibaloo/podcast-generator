const fs = require('fs');
const childProcess = require('child_process')
const metadata = require('music-metadata');
const defaultArgs = require('./args')

module.exports = (args) => {
    // sets default arguments if none provided
    args = defaultArgs(args);

    let fetchPlaylistFileName = (path) => new Promise((resolve,reject) => {

        fs.readdir(path,(error,files) => {
            if (error){
                reject(error)
            
            } else {
    
                // filter non playlist files
                files = files.filter((file) => {
                    return file.endsWith(".m3u")
                })
                
                // if a file exists
                if (files[0]){
                    resolve(files)
    
                } else {
                    reject(new Error("No Playlist File Found"))
                }
            }
    
        })
    })  
    
    let fetchAudioFileNames = (playlistFileUrl) => new Promise((resolve,reject) => {
        
        fs.readFile(playlistFileUrl,(error,data) => {
            if (!error){
    
                let nameList = data.toString().split("\n").filter(val => val != "")
                //let y = nameList.map(line => {return line.slice(0,-1)})
                resolve(nameList)
    
            } else {
                reject(error)
            }
        })
    }) 
    
    let getTotalAudioDuration = (files) => new Promise((resolve,reject) =>{
    //TODO maybe refactor
        let allPromises = files.map((url) => {
            return getSinglePlaytime(url)
        })
     
        Promise.all(allPromises)
            .then((results) => {
             
            // get sum of play time rounded to nearest second
            resolve(Math.ceil( results.reduce((accum,val) => {return accum + val})))
            
        }).catch(error => {
            reject(error)
        })
        
    
    })
    
    let getSinglePlaytime = (url) => new Promise((resolve,reject) => {
    
        metadata.parseFile(url)
            .then( metadata => {
            resolve(metadata.format.duration);
      
            }).catch( err => {
            reject(err.message);
            });
    })
    
    let getNameRoot = (directoryPath) => {
        let directoryName = directoryPath.split("\\").slice(-1)[0]
        return directoryPath + "\\" + directoryName.slice(0,-4)
    }
     
    let createVideo = (fileList,playtime,imagePath,outputFilename) => new Promise((resolve,reject) =>{
    
        let complexFilterArguments = fileList.map((val,index) => {return `[${index+1}:a]`}).join('')
    
        childProcess.exec(`ffmpeg -loop 1 -framerate 1 \
        -i "${imagePath}" \
        -i ${fileList.map(line => `"${line}"`).join(" -i ")} \
        -filter_complex "[0]scale='iw-mod(iw,2)':'ih-mod(ih,2)',format=yuv420p[v];${complexFilterArguments}concat=n=${fileList.length}:v=0:a=1[a]" \
        -map "[v]" -r 15 -map "[a]" \
        -tune stillimage -t ${playtime} -movflags +faststart "${outputFilename}" `
        ,(error,stdout,stderr) => {
            console.log(stdout)
            
            if (error){
                reject(error)
            
            } else {
                resolve(outputFilename)
            }
    
        })
    })
    
    var generate = (directoryUrl, foregroundImgUrl) => new Promise(async (resolve,reject) => {
    
    
        let playlistFileName = await fetchPlaylistFileName(directoryUrl);
        console.log("playlist file : ",playlistFileName)
    
        let audioFiles = await fetchAudioFileNames( directoryUrl + "\\" + playlistFileName)
        console.log("audio files : ",audioFiles)
    
        // prepend paths to filenames
        audioFiles = audioFiles.map(fileUrl => {
            return directoryUrl+"\\"+fileUrl
        })
    
        let totalAudioDuration = await getTotalAudioDuration(audioFiles)
        console.log("calculated total playtime ", totalAudioDuration)
    
        let outputFilename = getNameRoot(directoryUrl) + "_video.mp4"
        console.log("generating video", outputFilename)
            
        let generatedPath = await createVideo(audioFiles, totalAudioDuration, foregroundImgUrl, outputFilename)
        resolve(generatedPath) 
    })  
    
    let applyToSubfoldersOf = async (dir,func) => {
        console.log("function is ", func)
        func(dir)
    
        fs.readdirSync(dir)
            .filter((name) => {return name.indexOf(".") == -1 })
            .forEach(folderName => {
                applyToSubfoldersOf(dir + "\\" + folderName,func)
            })
            
    }
    
    //TODO change error code handling
    //TODO add options for output file picking
    //TODO change parameter passing
    
    var generateForSubFolders = (directoryUrl, foregroundImgUrl) => new Promise((resolve,reject) => {
    
        let allPromises = []
    
        applyToSubfoldersOf(directoryUrl,() => {
            allPromises.push(
                generate(directoryUrl,foregroundImgUrl)        )
        })
    
        Promise.allSettled(allPromises)
            .then(values => {
                console.log(values)
                resolve()
            })
    
    })


    return {
        singleDirectory : generate,
        recursiveDirectory:  generateForSubFolders
    }
}