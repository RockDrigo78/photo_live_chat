'use strict';
const fs = require('fs');

let usersList = [];
let messages = [];
let chat = [];

module.exports = function(io) {
	io.on('connection', (socket) => {
		console.log('New user connected');

		// delete photo
		socket.on('delete photo', (data) => {
			let path = data.substring(data.search("images"), data.length); 
			if(path.search("%") != -1){
				path = path.replace(/%20/g, " ");
				console.log(path, 'renaming success');
			}
			else{
				console.log(path);
			}
			fs.unlink('./public/' + path, (err) => {
				if (err){
					console.log("error");
				} 
				else{
					console.log(path,' was deleted');
					var albumPhotos = fs.readdirSync('./public/images/album');
					io.emit('newFileList', JSON.stringify(albumPhotos));
					console.log(albumPhotos);
					}
				});
		});
		
		// show complete message history to new user
		socket.emit ('welcome', JSON.stringify(chat));

		// server receive users save them and transmit back to client
		// to show on the html

		socket.on('new user', (data, callBack) => {
			if (usersList.indexOf(data) != -1) {
				callBack(false);
			} else {
				callBack(true);
				socket.usersList = data;
				usersList.push(socket.usersList);
				updateUsers();
				console.log(usersList);
			}
		});

		// server receive messages, save them and transmit back to client
		// to show on the html

		socket.on('send message', (data) => {
			chat.push({ message: data, user: socket.usersList });
			console.log(chat);
			io.sockets.emit('new message', chat);
			messages.push(data);
		});

		// to delete a user on disconnection
		socket.on('disconnect', (data) => {
			if (!socket.usersList) return;
			else usersList.splice(usersList.indexOf(socket.usersList), 1);
			updateUsers();
			console.log(usersList);
		});

		// to update the users list that is showed on chat
		const updateUsers = () => {
			io.sockets.emit('new user', usersList);
		};
		
	});
};
