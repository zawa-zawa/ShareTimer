let mode;   	//ストップウォッチのモード RUN/STOP
let startTime;  //スタートした時刻
let stopTime;	//ストップした時刻
let addTime;	//経過時間（ストップウォッチ再開時に加算する）
let millisec;   //1000分の1秒
let sec100;		//100分の1秒
let sec;		//秒
let min;		//分
let hour;  		//時
let gmt;		//タイムゾーンのオフセット値 例）GMT+0900 なら 標準時より9時間後をさしているので-9する
let timerId;	//タイマー


//ストップウォッチのモード
const RUN = 1;	//動作中
const STOP = 0;   //停止中

const resetStopWatch = () => {
	mode = STOP;
	addTime = 0;
	millisec = sec100 = sec = min = hour = 0;
	gmt = new Date().getTimezoneOffset() / 60;  //戻り値は分のため60で割る
	document.getElementById("time").innerHTML = "00:00:00:00";
}


const drawTime = () => {
	let strTime = "";
	let strSec100, strSec, strMin, strHour;

	//数値を文字に変換及び2桁表示設定
	strSec100 = "" + sec100;
	if ( strSec100.length < 2){
		strSec100 = "0" + strSec100;
	}
	strSec = "" + sec;
	if ( strSec.length < 2){
		strSec = "0" + strSec;
	}
	strMin = "" + min;
	if ( strMin.length < 2){
		strMin = "0" + strMin;
	}
	strHour = "" + hour;
	if ( strHour.length < 2){
		strHour = "0" + strHour;
	}
	//表示形式を設定
	strTime = strHour + ":" + strMin + ":" + strSec + ":" + strSec100;
	document.getElementById("time").innerHTML = strTime;
}


const startStop = (time) => {
	switch(mode){
		case STOP:		//スタートを押したとき
			mode = RUN;
			timerId = setInterval(runStopWatch, 10);
			document.getElementById("resetBtn").disabled = "true";		//クリアボタンを使用不可に
			document.getElementById("startStopBtn").innerHTML = "STOP";

			//スタート時刻を設定（ストップウォッチが進んでいれば加算）
			// startTime = new Date().getTime();
			startTime = time;
			//
			addTime = hour * 60 * 60 * 1000 + min * 60 * 1000 + sec * 1000 + millisec;
			startTime -= addTime;
			break;

		case RUN:  		//ストップを押したとき
			mode = STOP;
			clearInterval(timerId);

			//stopTime = new Date().getTime();
			stopTime = time;
			//
			document.getElementById("startStopBtn").innerHTML = "START";
			document.getElementById("resetBtn").disabled = "";  	//クリアボタンを使用可能に
			break;
	}
	// drawTime();
}


const runStopWatch = () => {
	//スタートからの差分をとる
	stopTime = new Date().getTime();
	diff = new Date(stopTime - startTime);
	//ミリ秒、100分の1秒、秒、分、時を設定
	millisec = diff.getMilliseconds();
	sec100 = Math.floor(millisec / 10);
	sec = diff.getSeconds();
	min = diff.getMinutes();
	hour = diff.getHours() + gmt;	//タイムゾーンのオフセットを考慮する

	drawTime(); //時間表示
	// timerId = setTimeout(runStopWatch, 10);
}

window.onload = function(){
	resetStopWatch();
}
