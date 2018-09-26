'use strict';

// 必要なモジュールを読み込む
var http = require('http');
var socketio = require('socket.io');
var fs = require('fs');

// HTTPサーバを生成する
var server = http.createServer(function(req, res) {
	// jsを読み込めるようにするための操作
	var url = req.url;	//リクエストからURLを取得
	var tmp = url.split('.'); //splitで . で区切られた配列にする
	var ext = tmp[tmp.length - 1]; //tmp配列の最後の要素(外部ファイルの拡張子)を取得
	var path = '.' + url; //リクエストされたURLをサーバの相対パスへ変換する
	switch (ext) {
		case 'css': //拡張子がcssならContent-Typeをtext/cssにする
			fs.readFile(path,function(err,data) {
				res.writeHead(200,{"Content-Type":"text/css"});
				res.end(data,'utf-8');
			});
			break;
		case 'js': //拡張子がjsならContent-Typeをtext/javascriptにする
			fs.readFile(path,function(err,data) {
				res.writeHead(200,{"Content-Type":"text/javascript"});
				res.end(data,'utf-8');
			});
			break;
		case '/': //拡張子が/(index.html)だった場合はindex.htmlを返す
			fs.readFile('./index.html',function(err,data) {
				res.writeHead(200,{"Content-Type":"text/html"});
				res.end(data,'utf-8');
			})
			break;
		}
}).listen(3000);

// HTTPサーバにソケットをひも付ける（WebSocket有効化）
var io = socketio.listen(server);

// connectionイベントを受信する
io.sockets.on('connection', function(socket) {
	var room = '';
	var name = '';

	// roomへの入室は、「socket.join(room名)」
	socket.on('client_to_server_join', function(data) {
		room = data.value;
		socket.join(room);
	});
	// client_to_serverイベント・データを受信
	socket.on('client_to_server', function(data) {
		if (data.value == "-data-startStopBtnPushed-dataEnd-"){
			// スタートストップが押された
		} else if (data.value == "-data-resetBtnPushed-dataEnd-") {
			// リセットが押された
		} else {
			io.to(room).emit('server_to_client', {value : data.value});
		}
	});
	// client_to_server_broadcastイベント・データを受信し、送信元以外に送信
	socket.on('client_to_server_broadcast', function(data) {
		socket.broadcast.to(room).emit('server_to_client', {value : data.value});
	});
	// client_to_server_personalイベント・データを受信し、送信元のみに送信
	socket.on('client_to_server_personal', function(data) {
		var id = socket.id;
		name = data.value;
		var personalMessage = "あなたは、" + name + "さんとして入室しました。"
		io.to(id).emit('server_to_client', {value : personalMessage});
	});
	// dicconnectイベントを受信し、退出メッセージを送信
	socket.on('disconnect', function() {
		if (name == '') {
			console.log("未入室のまま、どこかへ去っていきました。");
		} else {
			var endMessage = name + "さんが退出しました。"
			io.to(room).emit('server_to_client', {value : endMessage});
		}
	});
});
