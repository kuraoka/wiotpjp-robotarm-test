# node-red-flowbasket

A Node-RED node to backup/restore the node-red-flow to/from Cloudant.  
Mainly assumes the running at Node-RED on the IBM Bluemix.

## How to Install

Run the following command in the root directory of your Node-RED install

```
npm install node-red-flowbasket
```

## How to Use

### Preparations are necessary as follows before using Node
1. To create a Cloudant service
2. To create a DB to back up the flow
3. To create a following of Search Index
![SearchIndes](https://db.tt/PaI16Y3u)

### toBackup Node settings are as follows:
- SourceCloudant : To set up the connection information of CloudantDB the various settings of the Node-RED has been stored
- TargetCloudant : To set the connection information for CloudantDB to back up the Flow
- AppName : To set the Node-RED application name to back up the Flow
- TargetDB : To set the CloudantDB name to back up the Flow

### toRestore Node settings are as follows:
- RestoreCloudant : To set up the connection information of CloudantDB the various settings of the Node-RED has been stored
- BackupCloudant : To set the connection information for CloudantDB to back up the Flow
- AppName : To set the Node-RED application name to back up the Flow
- BackupDB : To set the CloudantDB name to back up the Flow

## Copyright and license

Copyright (c) 2016 Kota Suizu  
Released under the MIT license  
http://opensource.org/licenses/mit-license.php
