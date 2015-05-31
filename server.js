/**
 * Created by seven on 15/5/31.
 */
var http = require("http"),
    fs = require("fs"),
    path = require("path");


var server = http.createServer(function(req, res){
    var file = null,
        type = "application/octet-stream";

    if (req.url == "/hour.bin"){
        file = "www/hour.bin";
    }else if (req.url == "/"){
        file = "www/index.html";
        type = "text/html";
    }else if (req.url == "/hour.proto"){
        file = "www/hour.proto";
        type = "text/plain";
    }else if (/^\/(\w+(?:\.min)?\.(?:js))$/.test(req.url)) {
        file = req.url.substring(1);
        if (/\.js$/.test(file)) {
            type = "text/javascript";
            file = path.join(__dirname, "www", file);
        }
    }

    if (file) {
        fs.readFile( file, function(err, data) {
            if (err) {
                res.writeHead(500, {"Content-Type": type});
                res.end("Internal Server Error: "+err);
            } else {
                res.writeHead(200, {"Content-Type": type});
                res.write(data);
                res.end();
                console.log("Served www/"+file);
            }
        });
    } else {
        res.writeHead(404, {"Content-Type": "text/html"});
        res.end("Not Found");
    }
});

server.listen(8080);
server.on("listening", function() {
    console.log("Server started");
});
server.on("error", function(err) {
    console.log("Failed to start server:", err);
    process.exit(1);
});