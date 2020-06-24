const generator = require("./generator")
const fs = require("fs")



//"D:\\repos\\podcast-generator\\MA.jpg"
let imagePath = "C:\\Users\\roman\\OneDrive\\Pictures\\Ma-Vinil.png"

let searchDirectory = "D:\\Ma S\\Unknown album (6-23-2020 12-14-53 PM)"

let applyToSubfoldersOf = async (dir,func) => {
    console.log("function is ", func)
    func(dir)

    fs.readdirSync(dir)
        .filter((name) => {return name.indexOf(".") == -1 })
        .forEach(folderName => {
            applyToSubfoldersOf(dir + "\\" + folderName,func)
        })
        
}

applyToSubfoldersOf(searchDirectory,function (directory) {

    console.log("\n \ngenerating for : " + directory)
    generator.generate(directory,imagePath ,(error,generatedFile) => {
        if (error) {
            if (error == -1){
                console.log("no playlist file found")
            } else {
                throw error
            }    
        } else {
            console.log("generated file location ",generatedFile)
        }
        
    })

})
