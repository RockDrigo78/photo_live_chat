'use strict';
// express module
const express = require('express');
const app = express();
app.use(express.static('public'));
// bodiparser module
const bodyparser = require('body-parser');
// file sistem module
const fs = require('fs');
// sockets io module
const socketio = require('socket.io');
// http server module
const http = require('http');
// my sql module
//const mysql = require('mysql');
// formidable
const formidable = require('formidable');

// read photo album and send the info to client
app.get('/albumRead', (req, res) => {
	var albumPhotos = fs.readdirSync('./public/images/album');
	res.send(JSON.stringify(albumPhotos));
});

// Fileupload
app.post('/fileupload', (req, res) => {
	let formData = new formidable.IncomingForm();
	formData.uploadDir = './public/images/album';
	formData.keepExtensions = true;
	formData.multiples = true;
	formData.parse(req, (err, fields, files) => {
		if (err) {
			console.log(err);
			res.send(err);
		} else {
				if (files.fileInputInput.forEach) {
				files.fileInputInput.forEach((file) => fileRename(file));
				} 
				else {
				fileRename(files.fileInputInput);
				}
			res.send('File Upload Success');
		}
	});
});

// Return to original file name
const fileRename = (file) => {
	let oldPath = file.path;
	let newPath = './public/images/album/' + file.name;
	fs.rename(oldPath, newPath, (err) => {
		if (err) {
			console.log(err);
		} else {
			console.log(newPath + ' File Rename Success');
			//connect this with sockets to show in webpage instantly
			var albumPhotos = fs.readdirSync('./public/images/album');
			io.emit('newFileList', JSON.stringify(albumPhotos));
			console.log(albumPhotos);
		}
	});
};

// websockets connection
const server = http.createServer(app);
const io = socketio.listen(server);

// requiring the sockets.js file
require('./public/sockets.js')(io);

// server connection
app.set('port', 8080);

server.listen(app.get('port'), (err) => {
	if (err) console.log(err);
	else console.log('Server connected on port', app.get('port'));
});




//------------------------------------------------------
//               MY SQL --- FOR FUTURE CONNECTION
/*
// mysql create connection
const db = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '', // root has no password
	database: 'photo_live_chat'
});
// connect to mysql server
db.connect((err) => {
	if (err) {
		console.log('My SQL NOT CONNECTED !!!');
	} else {
		console.log('My sql connected');
	}
});
*/
