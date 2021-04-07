'use strict';
const fs = require('fs');
const generator = require('./ffmpeg-generator');

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

        console.log('fetching files from', sourceURL + "\\" + playlistFileName);
        let audioFileNames = fetchAudioFileNames(sourceURL + "\\" + playlistFileName);

        // prepend paths to filenames
        let audioFilePaths = audioFileNames.map(fileURL => sourceURL + "\\" + fileURL);

        let outputFileName = getFolderName(sourceURL) + "_video.mp4";

        generator.vidFromAudio(audioFilePaths, foregroundImgURL, outputFileName).then(() => {
            console.log("Finished", outputFileName);
            return resolve();
        }).catch(err => reject(err));
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

    let execPromissesSyncOn = (argListList, promToExecute, index = 0, results = []) => new Promise((resolve, reject) => {
        console.log(`${index} out of ${argListList.length}`);

        promToExecute(...argListList[index]).then((firstResults) => {
            results = [...results, firstResults];

            if (index != argListList.length - 1)
                execPromissesSyncOn(argListList, promToExecute, index + 1)
                .then(restRes => {
                    resolve([...results, ...restRes])
                }).catch(err => resolve([...results, ['failed', err]]));
            else
                resolve(results);
        }).catch(err => {
            results = [...results, ['failed', err]];

            if (index != argListList.length - 1)
                execPromissesSyncOn(argListList, promToExecute, index + 1)
                .then(restRes => {
                    resolve([...results, ...restRes])
                }).catch(err => resolve([...results, ['failed', err]]));
            else
                resolve(results);
        })
    });

    var generateForSubFolders = (directoryURL, foregroundImgURL) => new Promise((resolve, reject) => {

        let promisseArgs = []

        applyToSubfoldersOf(directoryURL, (dir) => {
            promisseArgs.push([dir, foregroundImgURL])
        })

        execPromissesSyncOn(promisseArgs, startVideoGeneration)
            .then(values => {
                resolve(values.filter(val => val))
            })
    })


    return {
        singleDirectory: startVideoGeneration,
        recursiveDirectory: generateForSubFolders
    }
}