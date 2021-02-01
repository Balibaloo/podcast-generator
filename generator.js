'use strict';
const fs = require('fs');
const childProcess = require('child_process');

const metadata = require('music-metadata');

module.exports = (args) => {

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

    let getVideoDuration = (audioFiles) => new Promise((resolve, reject) => {
        Promise.all(audioFiles.map(getSinglePlaytime))
            .then(results => resolve([Math.ceil(results.reduce((accum, val) => accum + val)), undefined])) // sum play time rounded to nearest second
            .catch(err => {
                console.log(err);
                resolve([-1, err]);
            });
    })

    let getSinglePlaytime = (URL) => new Promise((resolve, reject) => {
        metadata.parseFile(URL)
            .then(metadata => resolve(metadata.format.duration))
            .catch(reject);
    })

    let getFolderName = (directoryPath) => {
        let directoryName = directoryPath.split("\\").slice(-1)[0]
        return directoryPath + "\\" + directoryName.slice(0, -4)
    }

    let secodnsToHMSTime = d => {
        var h = Math.floor(d / 3600);
        var m = Math.floor(d % 3600 / 60);
        var s = Math.floor(d % 3600 % 60);
        return `${h}h:${m}m:${s}s`
    }

    let showVideoDetails = (outputFileName, playtime, fileList) => {
        let infoString = `begining to generate video ${outputFileName} | duration ${secodnsToHMSTime(playtime)}\nfrom file(s):`.toString();
        console.log(new Array(infoString.length + 1).join("-"))
        console.log(infoString);
        fileList.forEach(file => console.log(file));
    }

    let generateVideo = (fileList, imagePath, outputFileName, playtime) => new Promise(async (resolve, reject) => {

        showVideoDetails(outputFileName, playtime, fileList);
        let complexFilterArguments = fileList.map((val, index) => {
            return `[${index+1}:a]`
        }).join('')

        let proc = childProcess.spawn("ffmpeg", ['-loop', '1', '-framerate', '1',
            '-i', imagePath,
            ...[].concat.apply([], fileList.map((file, ind) => ["-i", file])),
            '-filter_complex', `[0]scale='iw-mod(iw,2)':'ih-mod(ih,2)',format=yuv420p[v];${complexFilterArguments}concat=n=${fileList.length}:v=0:a=1[a]`,
            '-map', '[v]', '-r', '15', '-map', '[a]',
            '-tune', 'stillimage', '-t', playtime, '-movflags', '+faststart', outputFileName,
        ])

        proc.on("exit", (code, signal) => {
            if (code === 0) resolve(outputFileName)
            else reject(signal);
        })
    })

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

    //TODO change error code handling
    //TODO add options for output file picking
    //TODO change parameter passing

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