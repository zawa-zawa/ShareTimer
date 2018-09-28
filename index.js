'use strict';

const isArray = (obj) => {
    return Object.prototype.toString.call(obj) === '[object Array]';
}

const isObject = (item) => {
  return typeof item === 'object' && item !== null && !isArray(item);
}

const escapeText = (text) => {
	var TABLE_FOR_ESCAPE_HTML = {
		"&": "&amp;",
		"\"": "&quot;",
		"<": "&lt;",
		">": "&gt;"
	};
	return text.replace(/[&"<>]/g, function(match) {
		return TABLE_FOR_ESCAPE_HTML[match];
	});
}

const checkText = (text, min, max) => {
	if (min > text.length || max < text.length) {
		return false;
	}
	text = escapeText(text);
	return true;
}

var socket = io.connect();
var isEnter = false;
var name = '';

// サーバからデータを受信した
socket.on("server_to_client", function(data) {
	if (data.value == "<-data-%startStopBtnPushed%-dataEnd->"){
		// alert("スタートストップ押されたって");
		startStop(data.serverTime);
	} else if (data.value == "<-data-%resetBtnPushed%-dataEnd->") {
		resetStopWatch();
	} else if (data.serverTime != null){
		startStop(data.serverTime);
		prependMsg(data.value);
	} else {
		// チャットテキスト
		prependMsg(data.value);
	}
});


$("#sendButton").on("click", function(e) {

	if ( roomAndNameCheck() ) {
		var selectRoom = $("#rooms").val();
		var message = $("#msgForm").val();
		$("#msgForm").val(''); // #msgFormにある名前を削除し，メッセージを入力できるように

		if (isEnter) {
			message = "[" + name + "]: " + message;
			// client_to_serverイベント・データを送信する
			socket.emit("client_to_server", {value : message});
		} else {
			name = message;
			var entryMessage = name + "さんが入室しました。";
			socket.emit("client_to_server_join", {value : selectRoom});
			// client_to_server_broadcastイベント・データを送信する
			socket.emit("client_to_server_broadcast", {value : entryMessage});
			// client_to_server_personalイベント・データを送信する
			socket.emit("client_to_server_personal", {value : name});
			changeLabel();
		}
	}
	e.preventDefault();
});


$("#startStopBtn").on("click", function(e) {
	socket.emit("client_to_server", {value : "<-data-%startStopBtnPushed%-dataEnd->"});
	// alert("スタートボタンが押したって送信した");
});

$("#resetBtn").on("click", function(e) {
	socket.emit("client_to_server", {value : "<-data-%resetBtnPushed%-dataEnd->"});
	// alert("リセットボタン押したって送信した");
});



const roomAndNameCheck = () => {
	// ルーム名チェック
	if ( checkText($("#rooms").val(), 3, 15) === false) {
		alert("ルーム名は3~15文字にしてください");
		return false;
	}
	// 名前，メッセージチェック
	if (isEnter) {
		if ( checkText($("#msgForm").val(), 1, 30) === false ) {
			alert("メッセージは1~30文字にしてください");
			return false;
		}
	} else {
		if ( checkText($("#msgForm").val(), 3, 15) === false ) {
			alert("名前は3~15文字にしてください");
			return false;
		}
	}
	return true;
}

const prependMsg = (text) => {
	$("#chatLogs").prepend("<div>" + text + "</div>");
}

// メッセージ部分
const changeLabel = () => {
	$(".nameLabel").text("メッセージ：");
	$("#rooms").prop("disabled", true);
	$("#sendButton").text("送信");
	isEnter = true;
}
