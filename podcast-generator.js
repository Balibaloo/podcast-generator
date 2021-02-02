'use strict';
const fs = require('fs');


module.exports = () => {

    let fetchPlaylistFileName = (path) => {

        let files = fs.readdirSync(path);

        if (!files[0]) {
            let err = new Error(`No files Found`);
            err.path = path;
            throw err;
        }

        if (files.some(x => x.endsWith('.mp4'))) {
            let err = new Error("directory contains a video, stoping to prevent overwriting")
            err.path = path;
            throw err;
        }

        // filter non playlist files
        files = files.filter((file) => file.endsWith(".m3u"));

        // if a file exists
        if (files[0]) {
            return files[0];

        } else {
            let err = new Error(`No Playlist File Found`);
            err.path = path;
            throw err;
        }
    }

    let fetchAudioFileNames = (playlistFileURL) => {
        let file = fs.readFileSync(playlistFileURL);

        // split by line and remove \r chars
        return file.toString().split(/[\n\r\s]/g).filter(val => val);
    }

    let getFolderName = (directoryPath) => {
        let directoryName = directoryPath.split("\\").slice(-1)[0]
        return directoryPath + "\\" + directoryName.slice(0, -4)
    }

    var startVideoGeneration = (sourceURL, foregroundImgURL) => new Promise(async (resolve, reject) => {

        let playlistFileName;
        try {
            playlistFileName = fetchPlaylistFileName(sourceURL);

        } catch (err) {
            return resolve([err.message, err.path]);
        }

        try {
            console.log('fetching files from', sourceURL + "\\" + playlistFileName);
            let audioFileNames = fetchAudioFileNames(sourceURL + "\\" + playlistFileName);


            // prepend paths to filenames
            let audioFilePaths = audioFileNames.map(fileURL => sourceURL + "\\" + fileURL);

            let [playtime, err] = await getVideoDuration(audioFilePaths);

            let outputFileName = getFolderName(sourceURL) + "_video.mp4";

            if (playtime === -1) {
                console.log("WARNING", outputFileName, "failed to start, it may be missing files, the playlist file is incorrect or some audio files are corrupt");
                reject(err);
                reject(new Error("Failed to fetch playtime"));

            } else {
                generateVideo(audioFilePaths, foregroundImgURL, outputFileName, playtime).then(() => {
                    console.log("Finished", outputFileName);
                    resolve();
                });
            }

        } catch (err) {
            reject(err);
        }
    })

    let applyToSubfoldersOf = async (dir, func) => {
        func(dir)

        fs.readdirSync(dir)
            .filter((name) => {
                return name.indexOf(".") === -1
            })
            .forEach(folderName => {
                applyToSubfoldersOf(dir + "\\" + folderName, func)
            })
    }

    var generateForSubFolders = (directoryURL, foregroundImgURL) => new Promise((resolve, reject) => {

        let allPromises = []

        applyToSubfoldersOf(directoryURL, (dir) => {
            allPromises.push(
                startVideoGeneration(dir, foregroundImgURL))
        })

        Promise.allSettled(allPromises)
            .then(values => {
                resolve(values.filter(val => val.value))
            })
    })


    return {
        singleDirectory: startVideoGeneration,
        recursiveDirectory: generateForSubFolders
    }
}