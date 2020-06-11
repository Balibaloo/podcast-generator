

let locatePlaylist = (folderPath) => {

    fs.readdir(folderPath,(error,files) => {
        
        if (!error){
            
            return files.filter((file) => {
                return file.endsWith(".m3u")
            })[0]

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