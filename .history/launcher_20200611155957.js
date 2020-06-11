const generator = require("./generator")


let tempPath = "D:\\repos\\podcast-generator\\74_03_30_geneve_MP3"
let imagePath = "D:\\repos\\podcast-generator\\MA.jpg"

generator.generate(tempPath,imagePath ,(generatedFile) => {
    console.log("should be done")
    console.log("file location ",generatedFile)
})