'use strict';

// connection with server
const socket = io();

// events listeners
const btnLogin = document.querySelector('#btnLogin');
const newUserBox = document.querySelector('#newUserBox');
const passwordBox = document.querySelector('#passwordBox');
const loginCard = document.querySelector('#loginCard');
const albumAndChatcontainer = document.querySelector('#albumAndChatcontainer');
const messageBox = document.querySelector('#messageBox');
const btnSendMessage = document.querySelector('#btnSendMessage');
const chatBox = document.querySelector('#chatBox');
const users = document.querySelector('#users');
const imageGallery = document.querySelector('#imageGallery');
const fileInput = document.querySelector('#fileInputFormular');
const btnUploadImage = document.querySelector('#btnUploadImage');
let uploadText = document.querySelector('#uploadText');

// photos delete function
albumAndChatcontainer.addEventListener('dblclick', (event) => {
	let confirmation = confirm("To delete photo, press ok");
	let elementClicked = event.target;

	if(confirmation==true){
		socket.emit('delete photo', elementClicked.src, (data) => {
			if (data) {
				uploadText.innerHTML = 'file deleted';
			} else {
				uploadText.innerHTML = 'file not deleted';
			}
		});
	}		
});

// function to append a new img child in html
const appendImageChild = (file) => {
	let imgNode = document.createElement('img');
	imgNode.src = 'images/album/' + file;
	imgNode.className = 'img-thumbnail mt-1 mx-auto';
	imgNode.style = 'width: 150px; height: 150px';
	imageGallery.appendChild(imgNode);
};

//show new photo in all sockets
socket.on('newFileList', (data) => {
	console.log(data, 'This comes from the socket listen');
	imageGallery.innerHTML = '';
	data = JSON.parse(data);
	data.forEach((el) => appendImageChild(el));
});

// get image album info from server
fetch('/albumRead')
	.then((res) => {
		return res.json();
	})
	.then((res) => {
		// MAKE THIS UPDATE ON REAL TIME!!!!
		res.forEach((el) => {
			appendImageChild(el);
		});
	});

// images upload
btnUploadImage.addEventListener('click', (e) => {
	e.preventDefault();
	let inputDataTest = fileInputInput.value;
	if (inputDataTest == '') {
		uploadText.innerHTML = 'Error - No Files Selected';
		setTimeout(function(){
			uploadText.innerHTML="";}, 3000);
	} else if (
		inputDataTest.substring(inputDataTest.length - 4) != '.jpg' &&
		inputDataTest.substring(inputDataTest.length - 4) != '.png'
	) {
		uploadText.innerHTML = 'File type Error - Upload only photos please';
		setTimeout(function(){
			uploadText.innerHTML="";}, 3000);
	} else {
		let formData = new FormData(fileInput);
		let xhr = new XMLHttpRequest();
		xhr.open('POST', '/fileupload', true);
		xhr.onload = () => {
			uploadText.innerHTML = xhr.responseText + '<br />';
			setTimeout(function(){
				uploadText.innerHTML="";}, 3000);
		};
		console.log(inputDataTest);
		xhr.send(formData);
	}
});

// users
// client send users to server
btnLogin.addEventListener('click', (e) => {
	e.preventDefault(); 
	if (newUserBox.value == '') {
		errorLoginMessage.innerHTML = 'Please enter a user';
		setTimeout(function(){
			errorLoginMessage.innerHTML="";}, 3000);
	} else {
		socket.emit('new user', newUserBox.value, (data) => {
			if (data) {
				loginCard.id = 'hide';
				albumAndChatcontainer.id = 'show';
			} else {
				errorLoginMessage.innerHTML = 'User already exists';
				setTimeout(function(){
					errorLoginMessage.innerHTML="";}, 3000);
			}
			newUserBox.value = '';
		});
	}
});

// Chat
// client send messages to server
btnSendMessage.addEventListener('click', (e) => {
	e.preventDefault(); // to avoid page automatic reload
	if (messageBox.value == '') {
		errorMessage.innerHTML = 'Please enter a message';
		setTimeout(function(){
			errorMessage.innerHTML="";}, 3000);
	} else {
		socket.emit('send message', messageBox.value);
		messageBox.value = '';
		errorMessage.innerHTML = '';
	}
});

// data reception to show on HTML
// server respond with the message to show in all connected sockets

const newMsg = data => {
	chatBox.innerHTML += '<div><i class="fas fa-user"></i> ' + '<b>' + data[data.length - 1].user + ': </b>' + data[data.length - 1].message + '</div>';
}

socket.on('new message', (data) => {
	//chatBox.innerHTML += '<div><i class="fas fa-user"></i> ' + '<b>' + data[data.length - 1].user + ': </b>' + data[data.length - 1].message + '</div>';
	newMsg(data);
	let msgs = Array.from ( chatBox.children );
	let h = msgs.reduce ((a,b) => a + b.offsetHeight, 0);
	chatBox.scrollTop = h;
});

// server respond with the users to show in all connected sockets
socket.on('new user', (data) => {
	let showUsers = '';
	for (let i = 0; i < data.length; i++) {
		showUsers += '<i class="fas fa-user"></i> ' + data[i] + ' ';
	}
	users.innerHTML = showUsers;
});

socket.on ( 'welcome', data => {
	console.log ( data );
	data = JSON.parse(data);
	data.forEach ( el => newMsg([el]))
})

