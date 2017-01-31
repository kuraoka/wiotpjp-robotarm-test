# node-red-flowbasket

Node-REDで作成したフローをバックアップや履歴管理するための、Node-RED用のNodeです。  
主にIBM Bluemix上のNode-REDでの稼働を想定しています。(他でも動くと思いますが、、、)

## How to Install

このNodeを使用するためには、Node-REDアプリケーションのpackage.json dependenciesに以下を追加し、再アップロードしてください。

- "node-red-flowbasket":"0.0.x"

### Bluemixの場合、package.jsonに追加する手順は以下となります
1. BluemixのNode-RED用Runtimeより、Starter codeをダウンロードする
2. DLしたアーカイブ内にあるpackage.jsonを開き、dependenciesに上記のエントリーを追加し保存する
3. Bluemix Runtimeにpushする(cf push <Application Name>)
4. Node-REDのWeb画面を開き、Node一覧のBackup_Restoreセクション内に、FlowBasket toBackup と FlowBasket toRestore が追加されたことを確認する

## How to Use

### Nodeを利用する前に以下準備が必要です
1. Flow情報を保存するCloudantサービスを作成する
2. 作成したCloudantサービスに、Flow情報を保存するDBを作成する
3. 作成したDBに、以下のSearch Indexを作成する
![SearchIndes](https://db.tt/PaI16Y3u)

### toBackup Nodeの設定は以下となります
- SourceCloudant : Node-REDの各種設定が保存されているCloudantDBの接続情報を設定する
- TargetCloudant : 上記DB内に格納されているFlow情報をバックアップするCloudantDBの接続情報を設定する
- AppName : SourceConfに設定したCloudantDBに設定を保存しているNode-REDのアプリケーション名を設定する
- TargetDB : Floe情報をバックアップするCloudantDBのDB名を設定する

### toRestore Nodeの設定は以下となります
- RestoreCloudant : Node-REDの各種設定が保存されているCloudantDBの接続情報を設定する
- BackupCloudant : Flow情報をバックアップしたCloudantDBの接続情報を設定する
- AppName : RestoreCloudantに設定したCloudantDBに設定を保存しているNode-REDのアプリケーション名を設定する
- TargetDB : Flow情報をバックアップしたCloudantDBのDB名を設定する

## Copyright and license

Copyright (c) 2016 Kota Suizu  
Released under the MIT license  
http://opensource.org/licenses/mit-license.php
