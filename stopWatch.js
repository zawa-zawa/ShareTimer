var mode;   	//ストップウォッチのモード RUN/STOP
var startTime;  //スタートした時刻
var nowTime;	//ストップした時刻
var addTime;	//経過時間（ストップウォッチ再開時に加算する）
var millisec;   //1000分の1秒
var sec100;		//100分の1秒
var sec;		//秒
var min;		//分
var hour;  		//時
var gmt;		//タイムゾーンのオフセット値 例）GMT+0900 なら 標準時より9時間後をさしているので-9する
var timerId;	//タイマー

//ストップウォッチのモード
var RUN = 1;	//動作中
var STOP = 0;   //停止中


const resetStopWatch = () => {
	mode = STOP;
	addTime = 0;
	millisec = sec100 = sec = min = hour = 0;
	gmt = new Date().getTimezoneOffset() / 60;  //戻り値は分のため60で割る
	document.getElementById("time").innerHTML = "00:00:00";
}


const drawTime = () => {
	var strTime = "";
	var strSec100, strSec, strMin, strHour;

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
	strTime = strHour + ":" + strMin + ":" + strSec;// + "." + strSec100;
	document.getElementById("time").innerHTML = strTime;
}


const startStop = () => {
	switch(mode){
		case STOP:		//スタートを押したとき
			mode = RUN;
			timerId = setTimeout(runStopWatch, 10);
			document.getElementById("btnClear").disabled = "true";		//クリアボタンを使用不可に
			document.getElementById("btnStart").innerHTML = "STOP";

			//スタート時刻を設定（ストップウォッチが進んでいれば加算）
			startTime = new Date().getTime();
			addTime = hour * 60 * 60 * 1000 + min * 60 * 1000 + sec * 1000 + millisec;
			startTime -= addTime;
			break;

		case RUN:  		//ストップを押したとき
			mode = STOP;
			clearTimeout(timerId);
			// nowTime = new Date().getTime();
			document.getElementById("btnStart").innerHTML = "START";
			document.getElementById("btnClear").disabled = "";  	//クリアボタンを使用可能に
			break;
	}
	drawTime();
}


const runStopWatch = () => {
	//スタートからの差分をとる
	nowTime = new Date().getTime();
	diff = new Date(nowTime - startTime);
	//ミリ秒、100分の1秒、秒、分、時を設定
	millisec = diff.getMilliseconds();
	sec100 = Math.floor(millisec / 10);
	sec = diff.getSeconds();
	min = diff.getMinutes();
	hour = diff.getHours() + gmt;	//タイムゾーンのオフセットを考慮する

	drawTime(); //時間表示
	timerId = setTimeout(runStopWatch, 10);
}

window.onload = function(){
	resetStopWatch();
}
