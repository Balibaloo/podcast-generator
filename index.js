'use strict';
const generator = require("./podcast-generator")

let imagePath = "C:\\Repos\\podcast-generator\\MA.jpg";
// let imagePath = "C:\\Pictures\\Ma-Vinil.png"
// let searchDirectory = "C:\\Repos\\podcast-generator\\testDir"
let searchDirectory = "C:\\Repos\\podcast-generator\\tempFiles\\X Luc";
// let searchDirectory = "D:\\Confer numérisées - MP3 pour baladeur\\1990\\90_01_17_lausanne_MP3";
let outputDirectory = "";


generator({}).recursiveDirectory(searchDirectory, imagePath, outputDirectory)
    .then((results) => {
        console.log("results = ", results)

    }).catch((error) => {
        console.log(error)
    })