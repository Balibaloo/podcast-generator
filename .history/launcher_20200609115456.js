const generator = require("./generator")


let tempPath = "E:\\Confer numérisées - MP3 pour baladeur\\1974\\74_10_07_villeurbanne_MP3"
let imagePath = "D:\repos\podcast-generator\MA.jpg"

generator.generate(tempPath,imagePath ,() => {
    console.log("should be done")
})