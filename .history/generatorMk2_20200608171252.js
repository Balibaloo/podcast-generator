

let locatePlaylist = (folderPath) => {

    fs.readdir(folderPath,(error,files) => {
        
        if (!error){
            
            let playlistFiles = files.filter((file) => {
                return file.endsWith(".m3u")
            })

            if (playlistFiles[0]){
                return playlistFiles[0]
            
            } else {
                
            }

        } else {
            console.log(error)
        }

    })

}







module.exports.generate = (folderPath, imagePath, mainCallback) => {

    let playlistPath = locatePlaylist(folderPath)
    let textPlaylistPath = generateTextPlaylist(playlistPath)
    let concatedAudioFilePath = concatenateAudio(textPlaylistPath)
    let videoFilePath = generateVideo(concatedAudioFilePath, imagePath)
    
    cleanup()

    mainCallback(videoFilePath) 
}