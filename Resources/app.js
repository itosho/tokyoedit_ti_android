// アプリの名前空間を生成
var app = {};

//必要なファイルを読み込む
Ti.include("app/ui/ui.js", "app/ui/all.js", "app/ui/my.js");

//アプリを起動するためのタブグループのファクトリメソッドを呼び出す
var tabGroup = app.ui.createApplicationTabGroup();

// ファクトリメソッドをオープン
tabGroup.open();