const childProcess = require('child_process');
const metadata = require('music-metadata');

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

module.exports.generator = (fileList, imagePath, outputFileName) => new Promise(async (resolve, reject) => {
  playtime = await getVideoDuration();

  showVideoDetails(outputFileName, playtime, fileList);

  let complexFilterArguments = fileList.map((val, index) => {
    return `[${index+1}:a]`
  }).join('')

  let proc = childProcess.spawn("ffmpeg", [
    '-loop', '1', '-framerate', '1',
    '-i', imagePath,
    ...[].concat.apply([], fileList.map((file, ind) => ["-i", file])),
    '-filter_complex', `[0]scale='iw-mod(iw,2)':'ih-mod(ih,2)',format=yuv420p[v];${complexFilterArguments}concat=n=${fileList.length}:v=0:a=1[a]`,
    '-map', '[v]', '-r', '15', '-map', '[a]',
    '-tune', 'stillimage', '-t', playtime, '-movflags', '+faststart', outputFileName,
  ])

  proc.on("exit", (code, signal) => {
    if (code === 0)
      resolve(outputFileName)
    else
      reject(signal);
  })
})