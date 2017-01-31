/**
* Copyright (c) 2016 Kota Suizu
* Released under the MIT license
* http://opensource.org/licenses/mit-license.php
**/

module.exports = function(RED) {
    "use strict";
    var request = require('request');



    // Cloudant接続情報を保持するConfig
    function FlowBasketConfig(n) {
        RED.nodes.createNode(this, n);
        this.name = n.name;
        this.host = n.host;
        var credentials = this.credentials;
        if ((credentials) && (credentials.hasOwnProperty("username"))) {
            this.username = credentials.username;
        }
        if ((credentials) && (credentials.hasOwnProperty("pass"))) {
            this.password = credentials.pass;
        }
    }
    RED.nodes.registerType("flowbasket-config", FlowBasketConfig, {
        credentials: {
            pass: {
                type: "password"
            },
            username: {
                type: "text"
            }
        }
    });

    // FlowBasket toBackup-Node NodeIO処理
    function FlowBasketToBackup(n) {
        RED.nodes.createNode(this, n);

        this.tmpSourceConfig = n.fbsourceconfig;
        this.fbSourceConfig = RED.nodes.getNode(this.tmpSourceConfig);

        this.tmpTargetConfig = n.fbtargetconfig;
        this.fbTargetConfig = RED.nodes.getNode(this.tmpTargetConfig);

        this.fbSourceAppName = n.fbsourceappname + "%2Fflow";
        this.fbTargetDbName = n.fbtargetdbname;

        var node = this;
        this.on('input', function(msg) {
            _docSelectByID(node.fbSourceConfig, "nodered", node.fbSourceAppName, function(err, response, body) {
                if (err || response.statusCode !== 200) {
                    console.log(err);
                    node.error("Failed to select source document. StatusCode = " + response.statusCode);

                } else {
                    var orgRev = {
                        "q": "org_rev: " + body._rev
                    };

                    var returnOrgRev = body._rev;

                    var getCurrentTime = function() {
                        var date = new Date();
                        date.setHours(date.getHours() + 9);
                        var d = date.getFullYear() + '-';
                        d += ('0' + (date.getMonth() + 1)).slice(-2) + '-';
                        d += ('0' + date.getDate()).slice(-2) + ' ';
                        d += ('0' + date.getHours()).slice(-2) + ':';
                        d += ('0' + date.getMinutes()).slice(-2) + ':';
                        d += ('0' + date.getSeconds()).slice(-2);
                        return d;
                    };
                    var targetMessage = "";
                    if (_isTypeOf('String', msg.payload.message)) {
                        targetMessage = msg.payload.message;
                    }

                    var isAddable = false;
                    if (_isTypeOf('Boolean', msg.payload.isAddable)) {
                        isAddable = msg.payload.isAddable;
                    }

                    var target_payload = {
                        "timestamp": getCurrentTime(),
                        "message": targetMessage,
                        "org_id": body._id,
                        "org_rev": body._rev,
                        "flow": body.flow
                    };

                    _docSelectByOrgRev(node.fbTargetConfig, node.fbTargetDbName, orgRev, function(err, response, body) {
                        if (err || response.statusCode !== 200) {
                            console.log(err);
                            node.error("Failed to select target document. StatusCode = " + response.statusCode);

                        } else if ((body.total_rows > 0) && (!isAddable)) {
                            // 正常終了　すでにバックアップドキュメントあり
                            // 結果をNodeへ出力
                            var sendmsg = {
                                "statusCode": 200,
                                "message": "Flow document has been already stored.",
                                "body": body
                            };
                            msg.payload = sendmsg;
                            node.send(msg);
                            node.log(RED._('Flow document has been already stored.'));

                        } else {
                            _docInsert(node.fbTargetConfig, node.fbTargetDbName, target_payload, function(err, response, body) {
                                if (err || response.statusCode !== 201) {
                                    console.log(err);
                                    node.error("Failed to insert document. StatusCode = " + response.statusCode);
                                } else {
                                    // 正常終了　バックアップに成功
                                    var sendmsg = {
                                        "statusCode": 201,
                                        "message": "Succeeded to store the flow document.",
                                        "org_rev": returnOrgRev,
                                        "body": body
                                    };
                                    msg.payload = sendmsg;
                                    node.send(msg);
                                    node.log(RED._('Succeeded to store the flow document.'));
                                }
                            });
                        }
                    });
                }
            });
        });
    }
    RED.nodes.registerType("FlowBasket toBackup", FlowBasketToBackup);




    // FlowBasket toRestore-Node NodeIO処理
    function FlowBasketToRestore(n) {
        RED.nodes.createNode(this, n);

        this.tmpSourceConfig = n.fbsourceconfig;
        this.fbSourceConfig = RED.nodes.getNode(this.tmpSourceConfig);

        this.tmpTargetConfig = n.fbtargetconfig;
        this.fbTargetConfig = RED.nodes.getNode(this.tmpTargetConfig);

        this.fbSourceAppName = n.fbsourceappname + "%2Fflow";
        this.fbTargetDbName = n.fbtargetdbname;

        var node = this;
        this.on('input', function(msg) {

            var orgRev = {
                "q": "org_rev: " + msg.payload
            };

            _docSelectByOrgRev(node.fbTargetConfig, node.fbTargetDbName, orgRev, function(err, response, body) {
                if (err || response.statusCode !== 200) {
                    console.log(err);
                    node.error("Failed to select by OrgRev backup document. StatusCode = " + response.statusCode);
                } else {
                    var target_id = body.rows[0].id;

                    _docSelectByID(node.fbTargetConfig, node.fbTargetDbName, target_id, function(err, response, body) {
                        if (err || response.statusCode !== 200) {
                            console.log(err);
                            node.error("Failed to select by id backup document. StatusCode = " + response.statusCode);
                        } else {

                            var restore_flow = body.flow;

                            _docSelectByID(node.fbSourceConfig, "nodered", node.fbSourceAppName, function(err, response, body) {
                                if (err || response.statusCode !== 200) {
                                    console.log(err);
                                    node.error("Failed to select source document. StatusCode = " + response.statusCode);
                                } else {
                                    var restore_payload = {
                                        "_id": body._id,
                                        "_rev": body._rev,
                                        "flow": restore_flow
                                    };

                                    _docInsert(node.fbSourceConfig, "nodered", restore_payload, function(err, response, body) {
                                        if (err || response.statusCode !== 201) {
                                            console.log(err);
                                            node.error("Failed to restore document. StatusCode = " + response.statusCode);
                                        } else {
                                            // 正常終了　バックアップに成功
                                            var sendmsg = {
                                                "statusCode": 201,
                                                "message": "Succeeded to restore the flow document.",
                                                "body": body
                                            };
                                            msg.payload = sendmsg;
                                            node.send(msg);
                                            node.log(RED._('Succeeded to restore the flow document.'));
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        });
    }
    RED.nodes.registerType("FlowBasket toRestore", FlowBasketToRestore);









    function _docInsert(fbconf, dbname, msg, callback) {

        // var myUrl = "https://" + fbconf.credentials.username + ":" + fbconf.credentials.pass + "@" + fbconf.host + "/" + dbname;
        var myUrl = "https://" + fbconf.host + "/" + dbname;

        var options = {
            url: myUrl,
            headers: {
                'Content-Type': 'application/json'
            },
            auth: {
                user: fbconf.credentials.username,
                password: fbconf.credentials.pass
            },
            json: true,
            body: msg
        };

        request.post(options, function(err, response, body) {
            callback(err, response, body);
        });
    }

    function _docSelectByID(fbconf, dbname, docid, callback) {

        //var myUrl = "https://" + fbconf.credentials.username + ":" + fbconf.credentials.pass + "@" + fbconf.host + "/" + dbname + "/" + docid;
        var myUrl = "https://" + fbconf.host + "/" + dbname + "/" + docid;

        var options = {
            url: myUrl,
            auth: {
                user: fbconf.credentials.username,
                password: fbconf.credentials.pass
            },
            json: true
        };

        request.get(options, function(err, response, body) {
            callback(err, response, body);
        });
    }

    function _docSelectByOrgRev(fbconf, dbname, msg, callback) {

        //var myUrl = "https://" + fbconf.credentials.username + ":" + fbconf.credentials.pass + "@" + fbconf.host + "/" + dbname + "/_design/Index/_search/IndexByOrgRev";
        var myUrl = "https://" + fbconf.host + "/" + dbname + "/_design/Index/_search/IndexByOrgRev";

        var options = {
            url: myUrl,
            headers: {
                'Content-Type': 'application/json'
            },
            auth: {
                user: fbconf.credentials.username,
                password: fbconf.credentials.pass
            },
            json: true,
            body: msg
        };

        request.post(options, function(err, response, body) {
            callback(err, response, body);
        });
    }

    function _isTypeOf(type, obj) {
        var clas = Object.prototype.toString.call(obj).slice(8, -1);
        return obj !== undefined && obj !== null && clas === type;
    }
}
