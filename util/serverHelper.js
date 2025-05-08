import * as fs from "fs"
import * as path from "path"
import * as url from "url"

const mimeTypes = {
    ".html" : "text/html",
    ".js" : "text/javascript",
    ".json" : "application/json",
    ".css" : "text/css",
    ".jpg" : "image/jpeg",
    ".png" : "image/png",
}

export function serveStaticFile(req, res) {
    const baseURL = req.protocol + "://" + req.headers.host + "/"
    const parsedURL = new URL(req.url, baseURL)
    let pathSanitize = path.normalize(parsedURL.pathname)
    const __filename = url.fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)
    
    let pathname = path.join(__dirname, "..", "static", pathSanitize)

    if (fs.existsSync(pathname)) {
        if (fs.statSync(pathname).isDirectory()) {
            pathname+="/index.html"
        }
        fs.readFile(pathname, function (err, data) {
            if (err) {
                res.statusCode = 500
                res.end("Error! File not found: ", err)
            } else {
                const extension = path.parse(pathname).ext
                res.setHeader("Content-type", mimeTypes[extension])
                res.end(data)
            }
        })
    } else {
        res.statusCode = 404
        res.end("Error! File not found")
    }
}

export function serveJsonObj(res, objData) {
    if (objData) {
        res.writeHead(200, mimeTypes[".json"])
    } else {
        res.writeHead(404, mimeTypes[".json"])
    }
    res.end(JSON.stringify(objData))
}

export async function getPostData(req) {
    return new Promise((resolve, reject)=>{
        let data = ""
        req.on("data", function (chunk) {
            data+=chunk
        })
        req.on("end", function () {
            const parsedData = JSON.parse(data)
            resolve(parsedData)
        })
    })
}