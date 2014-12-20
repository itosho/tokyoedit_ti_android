(function() {
	// アプリの名前空間を分割する
	app.ui = {};

	/* アプリを起動するためのタブグループのファクトリメソッド */
	app.ui.createApplicationTabGroup = function() {
		// 背景色設定
		Titanium.UI.setBackgroundColor('#000');
		// タブグループ作成
		var tabGroup = Ti.UI.createTabGroup();

		var tab1 = app.ui.all.createAllTokyoTab(); // All Tokyoタブ
		var tab2 = app.ui.my.createMyTokyoTab(); // My Tokyoタブ
		var tab3 = app.ui.createTokyoEditTab(); // About Tokyo Editタブ
		// 各タブをタブグループにセット
		tabGroup.addTab(tab1);
		tabGroup.addTab(tab2);
		tabGroup.addTab(tab3);

		return tabGroup;
	};

	/* About Tokyo Editタブのファクトリメソッド */
	app.ui.createTokyoEditTab = function() {
		// ウインドウ作成
		var win = Ti.UI.createWindow({
			title : 'About Tokyo Edit',
			backgroundColor : '#000',
			exitOnClose : true,
			fullscreen : false
		});
		// タブ作成
		var tab = Ti.UI.createTab({
			icon : '/img/light_2x/light_gear@2x.png',
			title : 'Tokyo Edit',
			window : win
		});

		// WebView作成（ResourceHTML）
		var web = Ti.UI.createWebView({
			url : '/docs/examples/hero.html'
		});

		win.add(web);

		return tab;
	};

})();
