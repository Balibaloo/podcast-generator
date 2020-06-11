const fs = require('fs');

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});


let getPlaylistFiles = (path,callback) => {
    fs.readdir(path,(error,files) => {
        
        if (!error){
            callback(files.filter(() => {
                return true
            }))
        } else {
            console.log(error)
        }

    })
}

readline.on("line", (line) => {
        
    getPlaylistFiles(__dirname,(files) => {
        console.log(files);
    })
})