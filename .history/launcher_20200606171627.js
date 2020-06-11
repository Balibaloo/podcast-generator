const generator = require("./generator")


let tempPath = 'D:\\repos\\podcast-generator\\74_03_30_geneve_MP3'

generator.generate(tempPath,() => {
    console.log("should be done")
})