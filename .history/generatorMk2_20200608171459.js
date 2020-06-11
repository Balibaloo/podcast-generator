

let locatePlaylist = (folderPath) => {

    fs.readdir(folderPath,(error,files) => {
        
        if (!error){
            
            let playlistFiles = files.filter((file) => {
                return file.endsWith(".m3u")
            })

            if (playlistFiles[0]){
                return playlistFiles[0]
            
            } else {
                throw new Error("No Playlist Files Found")
            }

        } else {
            throw error
        }

    })

}







module.exports.generate = async (folderPath, imagePath, mainCallback) => {

    let playlistPath = await locatePlaylist(folderPath)
    let textPlaylistPath = await generateTextPlaylist(playlistPath)
    let concatedAudioFilePath = await concatenateAudio(textPlaylistPath)
    let videoFilePath = await generateVideo(concatedAudioFilePath, imagePath)
    
    cleanup()

    mainCallback(videoFilePath) 
}