const generator = require("./generator")

//"D:\\repos\\podcast-generator\\MA.jpg"
let imagePath = "C:\\Users\\roman\\OneDrive\\Pictures\\Ma-Vinil.png"
let searchDirectory = "C:\\Repos\\podcast-generator"

let outputToSpecifiedDirectory = true
let outputDirectory = ""


generator(options).recursiveDirectory(searchDirectory,imagePath,outputDirectory)
    .then((results) => {
        console.log("results = ",results)

    }).catch((error) => {
        console.log(error)
    })
