(function() {
	// アプリの名前空間を分割する
	app.ui.my = {};

	// My Tokyタブのファクトリメソッド
	app.ui.my.createMyTokyoTab = function() {

		// ウインドウ生成
		var win = Titanium.UI.createWindow({
			title : 'My Tokyo Edit',
			backgroundColor : '#fff',
			exitOnClose : true,
			fullscreen : false
		});

		// マニュアルメニュー設置
		win.activity.onCreateOptionsMenu = function(e) {
			var menu = e.menu;
			var item = menu.add({
				title : 'About My Tokyo'
			});
			item.setIcon('/img/light_2x/light_info@2x.png');
			// メニュークリック時ダイアログ表示
			item.addEventListener('click', function(e) {
				var dialog = Ti.UI.createAlertDialog({
					message : 'My Tokyoではダウンロード済の動画をオフラインで視聴できます。',
					ok : 'CLOSE',
					title : 'About My Tokyo'
				}).show();
			});
		};

		// タブ作成
		var tab = Titanium.UI.createTab({
			icon : '/img/light_2x/light_download@2x.png',
			// icon: "Ti.App.Android.R.drawable.tab_icon",
			title : 'My Tokyo',
			backgroundColor : '#fff',
			window : win
		});

		// My Tokyoフォーカス時の処理
		win.addEventListener('focus', function(e) {
			// ダウンロードコンテンツや削除コンテンツを即反映させるため、表示するたびに常に動かす！

			// テーブルデータ初期化
			var movies = [];

			// ヘッダー行設定
			var headerRow = Ti.UI.createTableViewRow({
				className : 'header'
			});
			headerRow.backgroundColor = '#191919';
			headerRow.selectedBackgroundColor = '#191919';
			headerRow.height = 100;
			var headerLabel = Titanium.UI.createLabel({
				text : 'My Tokyo Edit',
				color : '#fff',
				textAlign : 'center',
				font : {
					fontSize : 32
				},
				width : 'auto',
				height : 'auto'
			});
			headerRow.add(headerLabel);
			movies.push(headerRow);

			// テーブルセクション（当面は日比谷線だけ。。。）
			var line = Ti.UI.createTableViewSection({
				headerTitle : ' ' + '東京メトロ日比谷線'
			});

			// ディレクトリファイル取得
			var dir = Titanium.Filesystem.getFile(
					Titanium.Filesystem.externalStorageDirectory, 'movies');
			if (!dir.exists()) { // ディレクトリがない場合新規作成
				dir.createDirectory();
			}

			// コンテンツ設定ファイル取得
			var fileContents = Ti.Filesystem.getFile(
					Titanium.Filesystem.resourcesDirectory,
					'/app/contents.json');
			// 文字列（JSON）へ変換
			var jsonContents = fileContents.read().toString();
			var objLine = JSON.parse(jsonContents);

			// 各テーブル行作成
			var tableFile = [];
			var tableRow = [];
			for ( var i = 0; i < objLine.hiviya.length; i++) {
				// 動画ファイル取得
				tableFile[i] = Ti.Filesystem.getFile(dir.nativePath,
						objLine.hiviya[i].file + '.mp4');
				// ダウンロード済確認
				if (tableFile[i].size > 1) {
					// ダウンロード済の場合テーブル行をセクションに追加
					tableRow[i] = app.ui.my.setTableRow(
							objLine.hiviya[i].title, objLine.hiviya[i].file
									+ '.mp4');
					line.add(tableRow[i]);
				}
			}

			// セクションをテーブルデータに挿入
			movies.push(line);
			// 最後にテーブルビュー作成！
			var tblView = Ti.UI.createTableView({
				data : movies,
				separatorColor : '#999'
			});
			win.add(tblView);

			// テーブルビュークリック処理
			tblView.addEventListener('click', function(e) {
				if (!e.row.url) {
					return false;
				} else {
					// 動画再生画面作成（ローカル再生）
					var childWin = app.ui.my.createStreamingWindow(e.row.title,
							e.row.url, tab);
					tab.open(childWin);
				}
			});

		});

		return tab;
	};

	// 動画再生画面作成ファンクション
	app.ui.my.createStreamingWindow = function(title, url, tab) {

		// ウインドウ作成
		var childWin = Titanium.UI.createWindow({
			title : title,
			backgroundColor : '#000',
			exitOnClose : false,
			fullscreen : false
		});

		// 動画プレイヤー作成
		var videoPlayer = Titanium.Media.createVideoPlayer({
			autoplay : true, // 自動再生有効
			backgroundColor : 'black',
			height : 'auto',
			width : 'auto',
			mediaControlStyle : Titanium.Media.VIDEO_CONTROL_DEFAULT,
			scalingMode : Titanium.Media.VIDEO_SCALING_ASPECT_FIT
		});

		// ディレクトリファイル取得
		var dir = Titanium.Filesystem.getFile(
				Titanium.Filesystem.externalStorageDirectory, 'movies');
		if (!dir.exists()) { // ディレクトリがない場合新規作成
			dir.createDirectory();
		}

		// 対象のローカルファイルを動画プレイヤーに追加する
		var playUrl = Ti.Filesystem.getFile(dir.nativePath, url);
		videoPlayer.url = playUrl.nativePath;
		childWin.add(videoPlayer);

		// プチ情報メニュー設置
		childWin.activity.onCreateOptionsMenu = function(e) {
			var menu = e.menu;
			var item = menu.add({
				title : '走行ルート確認'
			});
			item.setIcon('/img/light_2x/light_pin@2x.png');

			// メニュークリック時の処理
			item.addEventListener('click', function(e) {

				// ウインドウ作成
				var infoWin = Ti.UI.createWindow({
					title : title,
					backgroundColor : '#000',
					exitOnClose : false,
					fullscreen : false
				});
				// イメージビュー作成（地図画像表示）
				var arrUrl = url.split('.');
				var mapName = 'map_' + arrUrl[0] + '.jpg';
				var mapImage = Ti.UI.createImageView({
					backgroundColor : '#000',
					height : Ti.UI.FILL,
					width : Ti.UI.FILL,
					image : '/img/map/' + mapName
				});
				infoWin.add(mapImage);

				tab.open(infoWin);
			});
		};

		// 戻るボタン押下時再生終了
		childWin.addEventListener('android:back', function() {
			videoPlayer.hide();
			videoPlayer.release();
			videoPlayer = null;
			childWin.close();
		});

		return childWin;
	};

	// テーブル行作成ファンクション
	app.ui.my.setTableRow = function(title, file) {

		// ディレクトリファイル取得
		var dir = Titanium.Filesystem.getFile(
				Titanium.Filesystem.externalStorageDirectory, 'movies');
		if (!dir.exists()) { // ディレクトリがない場合新規作成
			dir.createDirectory();
		}

		// テーブル行作成
		var tableRow = Ti.UI.createTableViewRow({
			title : ' ' + title,
			backgroundColor : '#e5ebee',
			url : file,
			height : 90,
			leftImage : '/img/dark_2x/dark_play@2x.png',
			className : 'station'
		});

		// タイトルラベル作成
		var titleLabel = Titanium.UI.createLabel({
			text : title,
			color : '#1b1b1b',
			textAlign : 'left',
			left : 30,
			font : {
				fontSize : 32,
				fontWeight : 'bold'
			},
			width : 'auto',
			height : 'auto',
		});

		// 遷移ラベル作成
		var rightLabel = Titanium.UI.createLabel({
			text : ">>",
			color : '#1b1b1b',
			textAlign : 'center',
			right : 30,
			font : {
				fontSize : 32,
				fontWeight : 'bold'
			},
			width : 'auto',
			height : 'auto',
		});
		tableRow.add(titleLabel);
		tableRow.add(rightLabel);

		return tableRow;
	};

})();
