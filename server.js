const http = require('http');

const fs = require('fs');
const folder = "./public_html/"
const config = require('./configs/config.json');
const log = new console.Console(fs.createWriteStream('./logs/requests.txt'));
const mime = require('mime-types')
if (!fs.existsSync(folder)){
    fs.mkdirSync(folder, { recursive: true });
}


const server = http.createServer((req, res) => {
	
	
var contenttype = mime.contentType(req.url)
res.setHeader('Content-Type', contenttype)
	
process.on('uncaughtException', function (err) {
	res.statusCode = 500
	res.write(`<html><head><title>Error 500</title></head><body><center><h1>500 Internal Server Error</h1><p>An error happend in your request.</p></center></body></html>`)
console.error('\x1b[31m [ERROR] An error handling in user request')
console.warn('\x1b[33m [WARN] Please report this bug to our github')
console.warn('\x1b[33m [WARN] ERROR:')
console.warn('\x1b[33m' + err)
console.log('\x1b[0m')

log.error("[ERROR] An error handling in user request")
log.warn('[WARN] Please report this bug to our github')
log.warn("[WARN] ERROR:")
log.warn(err)
res.end()
return
});
	
	
	
 log.log(" [INFO] " + "[" + req.socket.remoteAddress + "] "+ Date() + " " + req.method + " " + req.url)
 console.log(" [INFO] " + "\x1b[0m\x1b[32m" + req.socket.remoteAddress + "] "+ Date() + " " + req.method + " " + req.url)
 if(req.url == "/"){
	fs.open('./public_html/index.html', 'r', function(err, fileToRead){
	if (!err){
        fs.readFile(fileToRead, {encoding: 'utf-8'}, function(err,data){
            if (!err){
 	    res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(data);
            res.end();
            }else{
                res.writeHead(404, {'Content-Type': 'text/html'});
                res.end(`Error: No index file found! Please create a new one`)
            }
        });
    }else{
	    	res.writeHead(404, {'Content-Type': 'text/html'});
                res.end(`Error: No index file found! Please create a new one`)
        
    }
});
 }
 else if(req.url == config.authentication_url){
  const auth = {login: config.authentication_username, password: config.authentication_password}
  const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
  const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':')
  if (login && password && login === auth.login && password === auth.password) {
	fs.readFile(config.authentication_file, 'utf8', function (err,data) {
  if (err) {
	  	 res.statusCode = 500
	  	 res.end('Error: No authentication file found')
	  console.warn('\x1b[33m [WARN] User ' + req.socket.remoteAddress + ' passed the authentication with error')
  }
	 res.statusCode = 200
	 res.end(data)
	console.warn('\x1b[33m [WARN] User ' + req.socket.remoteAddress + ' passed the authentication')
});
	return;
  }
  res.setHeader('WWW-Authenticate', 'Basic realm="' + config.authentication_realm + '"')
  res.writeHead(401, {'Content-Type': 'text/html'});
  res.end(`<html><head>
    <title>Error 401</title>
</head><body>
<center>
    <h1>401 Authentication required</h1>
    <p>You don't have authentication to view the page<p>
</center>
</body></html>`)
console.warn('\x1b[33m [WARN] User ' + req.socket.remoteAddress + ' failed the authentication')
 }
 else if(req.url.includes == "/%"){
	res.writeHead(400, {'Content-Type': 'text/html'});
	res.end(`<html><head>
    <title>Error 400</title>
</head><body>
<center>
    <h1>400 Bad Request</h1>
    <p>The request is invalid.</p> <br>
    <p>Reason: The URL is invalid</p>
</center>
</body></html>`)
 }
 else if(req.url.length > 500){
	res.writeHead(414, {'Content-Type': 'text/html'});
	res.end(`<html><head>
    <title>Error 414</title>
</head><body>
<center>
    <h1>414 URI Too Long</h1>
    <p>The request url "/..." is too long to progress by the server.</p>
</center>
</body></html>`)
 }
   else if(req.url == config.blacklistedurls){
	res.writeHead(403, {'Content-Type': 'text/html'});
	res.end(`<html><head>
    <title>Error 403</title>
</head><body>
<center>
    <h1>403 Forbidden</h1>
    <p>You don't have permission to use or view the page</p>
</center>
</body></html>`)
 }
 else if(req.url == "/login.html"){
	res.writeHead(403, {'Content-Type': 'text/html'});
	res.end(`<html><head>
    <title>Error 403</title>
</head><body>
<center>
    <h1>403 Forbidden</h1>
    <p>You don't have permission to use or view the page</p>
</center>
</body></html>`)
 }
 else{
	fs.open('./public_html/' + req.url, 'r', function(err, fileToRead){
    if (!err){
        fs.readFile(fileToRead, {encoding: 'utf-8'}, function(err,data){
            if (!err){
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(data);
            res.end();
            }else{
                res.end('404 Not Found')
            }
        });
    }else{
		fs.open('./public_html/404.html', 'r', function(err, fileToRead){
		if (!err){
			fs.readFile(fileToRead, {encoding: 'utf-8'}, function(err,data){
            if (!err){
				res.writeHead(404, {'Content-Type': 'text/html'});
				res.write(data);
				res.end();
            }else{
				res.statusCode = 404
                res.end(`<html><head>
    <title>Error 404</title>
</head><body>
<center>
    <h1>404 Not Found</h1>
    <p>The requested url `  + req.url + ` not found</p>
</center>
</body></html>`)
            }
        });
	 }else{
		res.statusCode = 404
        res.end(`<html><head>
    <title>Error 404</title>
</head><body>
<center>
    <h1>404 Not Found</h1>
    <p>The requested url ` + req.url + ` was not found</p>
</center>
</body></html>`)
	 }
	});
    }
 });
}
});

server.listen(config.port, config.host, () => {
  console.log(`\x1b[0m\x1b[32m[INFO] Server started at http://` + config.host + ":" + config.port + "/" );
});
