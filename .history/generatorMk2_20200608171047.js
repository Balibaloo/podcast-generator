



module.exports.generate = (folderPath, imagePath, mainCallback) => {

    let playlistPath = locatePlaylist(folderPath)
    let textPlaylistPath = generateTextPlaylist(playlistPath)
    let concatedAudioFilePath = concatenateAudio(textPlaylistPath)
    let videoFilePath = generateVideo(concatedAudioFilePath, imagePath)
    
    cleanup()

    mainCallback(videoFilePath) 
}