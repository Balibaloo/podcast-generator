'use strict';
const generator = require("./podcast-generator")

let imagePath = "C:\\Repos\\podcast-generator\\MA.jpg";
// let imagePath = "C:\\Pictures\\Ma-Vinil.png"
// let searchDirectory = "C:\\Repos\\podcast-generator\\testDir"
let searchDirectory = "C:\\Repos\\podcast-generator\\tempFiles";
// let searchDirectory = "C:\\Repos\\podcast-generator\\tempFiles\\Done\\Luc done\\93_05_08_giez_MP3";
let outputDirectory = "";


generator({}).recursiveDirectory(searchDirectory, imagePath, outputDirectory)
    .then((results) => {
        console.log("results = ", results.filter(result => result[0] === "failed"))

    }).catch((error) => {
        console.log(error)
    })