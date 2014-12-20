(function() {
	// アプリの名前空間を分割する
	app.ui.all = {};

	// All Tokyoタブのファクトリメソッド
	app.ui.all.createAllTokyoTab = function() {
		// ウインドウ作成
		var win = Titanium.UI.createWindow({
			title : 'All Tokyo Edit',
			backgroundColor : '#fff',
			exitOnClose : true,
			fullscreen : false
		});

		// マニュアルメニュー設置
		win.activity.onCreateOptionsMenu = function(e) {
			var menu = e.menu;
			var item = menu.add({
				title : 'About All Tokyo'
			});
			item.setIcon('/img/light_2x/light_info@2x.png');
			// メニュークリック時ダイアログ表示
			item.addEventListener('click', function(e) {
				var dialog = Ti.UI.createAlertDialog({
					message : 'All Tokyoではすべての動画をストリーミング再生で視聴できます。',
					ok : 'CLOSE',
					title : 'About All Tokyo'
				}).show();
			});
		};

		// タブ作成
		var tab = Titanium.UI.createTab({
			icon : '/img/light_2x/light_stats-bars@2x.png',
			title : 'All Tokyo',
			backgroundColor : '#fff',
			window : win
		});

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
			text : 'All Tokyo Edit',
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

		// コンテンツ設定ファイル取得
		var fileContents = Ti.Filesystem.getFile(
				Titanium.Filesystem.resourcesDirectory, '/app/contents.json');
		// 文字列（JSON）へ変換
		var jsonContents = fileContents.read().toString();
		var objLine = JSON.parse(jsonContents);

		// 各テーブル行作成
		var tableRow = [];
		for ( var i = 0; i < objLine.hiviya.length; i++) {
			tableRow[i] = app.ui.all.setTableRow(objLine.hiviya[i].title,
					objLine.hiviya[i].file + '.mp4');
			line.add(tableRow[i]);
		}
		// セクションをテーブルデータに挿入
		movies.push(line);

		// 最後にテーブルビュー作成！
		var tblView = Titanium.UI.createTableView({
			data : movies,
			separatorColor : '#999'
		});
		win.add(tblView);

		// テーブルビュークリック処理
		tblView.addEventListener('click', function(e) {

			if (!e.row.url) {
				return false;
			} else {
				// 動画再生画面作成（ストリーミング再生）
				var childWin = app.ui.all.createStreamingWindow(e.row.title,
						e.row.url);
				tab.open(childWin);
			}
		});

		return tab;
	};

	// 動画再生画面作成ファンクション
	app.ui.all.createStreamingWindow = function(title, url) {

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

		// 対象のファイル（サーバー上）を動画プレイヤーに追加する
		videoPlayer.url = url;
		childWin.add(videoPlayer);

		// ダウンロードメニュー設置
		childWin.activity.onCreateOptionsMenu = function(e) {
			var menu = e.menu;
			var item = menu.add({
				title : 'ダウンロード'
			});
			item.setIcon('/img/light_2x/light_check@2x.png');

			// メニュークリック時の処理
			item.addEventListener('click', function(e) {

				// ネットワーク環境がない場合エラーを返す（ガード節）
				if (Titanium.Network.online == false) {
					// ダイアログ生成+表示
					var dialog = Ti.UI.createAlertDialog({
						message : 'パラレルワールドに接続することが出来ません。',
						ok : 'OK',
						title : 'NETWORK ERROR'
					}).show();
				}

				// プログレスバー生成
				var ind = Titanium.UI.createProgressBar({
					width : Ti.UI.FILL,
					min : 0,
					max : 100,
					value : 0,
					height : Ti.UI.SIZE,
					color : '#888',
					message : 'ダウンロード中…',
					font : {
						fontSize : 14
					},
					top : 20
				});

				// HTTPオブジェクト生成（Ajaxと同じような記述）
				var xhr = Titanium.Network.createHTTPClient({
					// 5000ミリ秒
					timeout : 5000
				});

				// ロード完了時
				xhr.onload = function() {
					// プログレスバー削除
					childWin.remove(ind);
					// URL分解
					var arrUrl = url.split("/");
					// ファイル名（例：hiviya_01）
					var fileName = arrUrl[5];

					// ファイル保存（iOSと異なるので要注意）
					var dir = Titanium.Filesystem.getFile(
							Titanium.Filesystem.externalStorageDirectory,
							'movies');
					if (!dir.exists()) {
						dir.createDirectory();
					}
					var file = Titanium.Filesystem.getFile(dir.nativePath,
							fileName);
					var result = file.write(this.responseData);

					// 結果ダイアログ表示
					if (result) { // 成功時
						var filePath = dir + '/' + fileName;
						Ti.Media.Android.scanMediaFiles([ file.nativePath ],
								null, function(e) {
									var dialog = Ti.UI.createAlertDialog({
										message : 'ダウンロードが完了しました。',
										ok : 'OK',
										title : 'SUCCESS'
									}).show();
								});
					} else { // 失敗時
						var dialog = Ti.UI.createAlertDialog({
							message : 'ダウンロードに失敗しました。再度お試しください。',
							ok : 'OK',
							title : 'DOWNLOAD ERROR'
						}).show();
					}

					// メモリリーク対策（効果ある？）
					dir = null;
					file = null;
					this.responseData = null;
					xhr.onload = null;
					xhr.onreadystatechange = null;
					xhr.ondatastream = null;
					xhr.onerror = null;
					xhr = null;

				};

				// エラー発生時
				xhr.onerror = function(error) {
					// プログレスバー削除
					childWin.remove(ind);
					// ダイアログ生成+表示
					var dialog = Ti.UI.createAlertDialog({
						message : 'ダウンロードに失敗しました。再度お試しください。',
						ok : 'OK',
						title : 'DOWNLOAD ERROR'
					}).show();

					// メモリリーク対策
					xhr.onload = null;
					xhr.onreadystatechange = null;
					xhr.ondatastream = null;
					xhr.onerror = null;
					xhr = null;
				};

				// プログレスバー進捗率初期化
				var val = 0;
				// 通信処理時
				xhr.ondatastream = function(e) {
					// プログレスバー表示
					childWin.add(ind);
					ind.show();
					val = Math.floor(e.progress * 100);
					ind.value = val;

					// 進捗率表示（めっちゃ遅くなる）
					/*
					 * interval = setInterval(function() { //
					 * 100%の時（一瞬なのでほとんどみえない） if (e.progress == 1) { ind.value =
					 * 100; ind.message = 'ダウンロード完了'; clearInterval(interval);
					 * ind.hide(); // return; }
					 * 
					 * ind.value = val; // ind.message = 'ダウンロード中：' + val + '
					 * %'; }, 1000);
					 */
				};

				xhr.open('GET', videoPlayer.url, true);
				// リクエスト送信（引数としてJSON値を入れるとパラメータ化される）
				xhr.send();

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
	app.ui.all.setTableRow = function(title, file) {

		// テーブル行作成
		var tableRow = Ti.UI.createTableViewRow({
			title : ' ' + title,
			backgroundColor : '#e5ebee',
			height : 90,
			url : 'http://itosho.parallel.jp/app/tokyoedit/' + file,
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
