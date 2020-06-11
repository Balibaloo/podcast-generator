



module.exports.generate = (folderPath, mainCallback) => {

    let playlistPath = locatePlaylist()
    let textPlaylistPath = generateTextPlaylist()
    let concatedAudioFilePath = concatenateAudio()
    let videoFilePath = generateVideo()
    
    cleanup()

}