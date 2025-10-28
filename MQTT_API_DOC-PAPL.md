# MQTT API  
===================
***

版本          | 修訂日期     | 修訂者       |  修訂內容     |  備註       |
-------------|-------------|-------------|-------------|-------------|
v1.0         | 2022/08/30     |           |   初稿          |無            |
===================
***

A. 接收介面：

1. [獲取特定組別所有人員ID](#1)
2. [更變特定組別人員資訊](#2)
3. [給定裝置上所有組別](#3)
4. [設定通行策略](#4)
5. [解除特定告警](#5)
6. [設置設備配置](#7)
7. [下發通知](#11)
8.  [觸發遠程更新](#15)


#Topic String說明
***

Topic的 {   } 中間需替換成特定值，請參照下表

{替換字串}         | 需代入值     | 
-------------|-------------|
{company-id}        | 公司id     | 
{group-id}         | 群組id   | 
{device-id}         | deviceSN/LDID    | 
{partner}         | 與固件版本有關    | 
***

#通用欄位說明
***

* 細節資料都會放在JSON的Data或是ConnString內
* 備註除非註明非必要，否則都是必須帶入的欄位
***

#接收介面
***

<div id="1"></div>

##1. 給定特定組別所有人員ID

### <font size=5>Topic: </font><font color=#ff0000 size=5>/{partner}/company/{company-id}/group/{group-id}/user</font> 

* 使用Qos : 1
* 說明：給定group_id下所有人員的id，

* Payload範例：

>

    {
      "msg_id": 1,
      "status": "ALL",
      "connType": "connType",
      "connId": "connId",
      "group_info": {
        "group_id": 430,
        "updated_at": 1526633538,
      },
      "data": [
        {
          "user_id": 10001,
          "update_at": 1526644538
        },
        {
          "user_id": 10001,
          "update_at": 1526644538
        }
      ]
    }

欄位說明：

名稱         | 類型    | 說明      |  備註
-------------|-------------|-------------|------------|
msg_id         | Integer     |           |  非必要欄位
status         | Integer     |           |  非必要欄位
group_info         | JSON     |           |  非必要欄位
group_id         | Integer     |  同Topic中的Group id  |  非必要欄位
updated_at         | Long     |           |  非必要欄位
data           | JSONArray   |    存放此Group ID 中所有的User ID資訊      |  
user_id         | Integer     |   User ID    |  
update_at         | Long     |   此人員在Server端更新的時間 |  

<div id="2"></div>

##2. 更變特定組別人員資訊

### <font size=5 >Topic: </font><font color=#ff0000 size=5>/{partner}/company/{company-id}/group/{group-id}/user/update</font> 

* 使用Qos : 1
* 說明：新增、刪除、修改group_id下所有人員的id，
* Payload範例：

        {
          "msg_id": 1,
          "status": "MODIFY",
          "connType": "connType",
          "connId": "connId",
          "group_info": {
            "group_id": 430,
            "updated_at": 1526633538
          },
          "data": [
            {
              "user_id": 10001,
              "update_at": 1526644538
            },
            {
              "user_id": 10002,
              "update_at": 1526644538
            }
          ]
        }

欄位說明：

名稱         | 類型    | 說明      | 備註
-------------|-------------|-------------|------------|
msg_id         | Integer     |  一個group\_id會帶一個msg\_id   |  若上次msg\_id與此次不同，裝置會無視此次動作並且連結group\_id與此次msg\_id連結
status         | String     |    1. "INSERT" : 新增<br> 2. "MODIFY" : 更變 <br> 3. "DELETE" : 刪除       |  
group_info         | JSON     |           |  非必要欄位
group_id         | Integer     |           |  非必要欄位
updated_at        | Long     |           |  非必要欄位
data         | Integer     |     存放需要處理的User id      |  
user_id         | Integer     |     User ID      |  
update_at         | Long     |    此人員在Server端更新的時間       |  

<div id="3"></div>

##3. 獲取裝置上所有組別

### <font size=5 >Topic: </font><font color=#ff0000 size=5>/{partner}/company/{company-id}/group</font>

* 使用Qos : 1
* 說明：給定裝置組別的ID
* Payload範例：

>

    {
      "connType": "connType",
      "connId": "connId",
      "status": "status",
      "device_info": {
        "device_id": "device_id",
        "updated_at": 1526633538,
      },
      "data": [
        {
          "group_id": 213,
          "update_at": 1526644538,
        },
        {
          "group_id": 578,
          "update_at": 1526644538,
        }
      ]
    }

欄位說明：

名稱         | 類型    | 說明      |  備註
-------------|-------------|-------------|------------|
status         | String    |           |    非必要欄位       |  
device_info         | JSON     |           |  非必要欄位
device_id         | String     |           |  非必要欄位
updated_at         | Long     |           |  非必要欄位
data         | JSONArray     |     放置主要訊息      |  
group_id         | Integer     |     組別ID      |  
update_at         | Long     |       此組別ID在Server上被更新的時間    |  

<div id="4"></div>

##4. 設定通行策略

### <font size=5 >Topic: </font><font color=#ff0000 size=5>/{partner}/company/{company-id}/device/{device-id}/accessStrategy</font> 

* 使用Qos : 1
* 說明：批次設定組別的通行策略
* Payload範例：

        {
          "status": "status",
          "connType": "connType",
          "connId": "connId",
          "device_info": {
            "device_id": 1,
            "updated_at": 1524433263
          },
          "data":[
            {
                "group_id":100,
                "updated_at":"2017-12-20 00:00:00",
                "timetable_info":{
                    "id":2,
                    "name":"celuename2",
                    "monday":"000000000011111111111111111111111110000000000000",
                    "tuesday":"000000000000000000000000000000000000000000000000",
                    "wednesday":"000000000000000000000000000000000000000000000000",
                    "thursday":"000000000000000000000000000000000000000000000000",
                    "friday":"000000000000000000000000000000000000000000000000",
                    "saturday":"000000000000000000000000000000000000000000000000",
                    "big_saturday":"000000000000000000000000000000000000000000000000",
                    "sunday":"000000000000000000000000000000000000000000000000",
                    "holiday":"000000000000000000000000000000000000000000000000",
                    "special_days":[
                        {
                            "id":2,
                            "timetable_id":2,
                            "date":"0000-09-11",
                            "remark":"每年特殊1"
                        },
                        {
                            "id":3,
                            "timetable_id":43,
                            "date":"2019-09-10",
                            "remark":"特殊2"
                        }
                    ],
                    "monday_period":[
                        {
                            "start_time":"00:30:00",
                            "end_time":"00:59:00"
                        }
                    ],
                    "tuesday_period":[
                        {
                            "start_time":"00:30:00",
                            "end_time":"00:59:00"
                        }
                    ],
                    "wednesday_period":[
                        {
                            "start_time":"00:30:00",
                            "end_time":"00:59:00"
                        }
                    ],
                    "thursday_period":[
                        {
                            "start_time":"00:30:00",
                            "end_time":"00:59:00"
                        }
                    ],
                    "friday_period":[
                        {
                            "start_time":"00:30:00",
                            "end_time":"00:59:00"
                        }
                    ],
                    "saturday_period":[
                        {
                            "start_time":"00:30:00",
                            "end_time":"00:59:00"
                        }
                    ],
                    "big_saturday_period":[
                        {
                            "start_time":"00:30:00",
                            "end_time":"00:59:00"
                        }
                    ],
                    "sunday_period":[
                        {
                            "start_time":"00:30:00",
                            "end_time":"00:59:00"
                        }
                    ],
                    "holiday_period":[
                        {
                            "start_time":"00:30:00",
                            "end_time":"00:59:00"
                        }
                    ],
                    "start_timestamp":1546275661000,
                    "end_timestamp":1546275661000
                }
            },
            {
                "group_id":105,
                "updated_at":"2018-12-20 00:00:00",
                "timetable_info":{
                    "id":3,
                    "name":"celuename4",
                    "monday":"000000000011111111111111111111111110000000000000",
                    "tuesday":"000000000011111111111111111111111110000000000000",
                    "wednesday":"000000000011111111111111111111111110000000000000",
                    "thursday":"000000000011111111111111111111111110000000000000",
                    "friday":"000000000011111111111111111111111110000000000000",
                    "saturday":"000000000011111111111111111111111110000000000000",
                    "sunday":"000000000011111111111111111111111110000000000000",
                    "holiday":"000000000011111111111111111111111110000000000000",
                    "special_days":null,
                    "monday_period":[
                        {
                            "start_time":"00:30:00",
                            "end_time":"00:59:00"
                        }
                    ],
                    "tuesday_period":[
                        {
                            "start_time":"00:30:00",
                            "end_time":"00:59:00"
                        }
                    ],
                    "wednesday_period":[
                        {
                            "start_time":"00:30:00",
                            "end_time":"00:59:00"
                        }
                    ],
                    "thursday_period":[
                        {
                            "start_time":"00:30:00",
                            "end_time":"00:59:00"
                        }
                    ],
                    "friday_period":[
                        {
                            "start_time":"00:30:00",
                            "end_time":"00:59:00"
                        }
                    ],
                    "saturday_period":[
                        {
                            "start_time":"00:30:00",
                            "end_time":"00:59:00"
                        }
                    ],
                    "sunday_period":[
                        {
                            "start_time":"00:30:00",
                            "end_time":"00:59:00"
                        }
                    ],
                    "holiday_period":[
                        {
                            "start_time":"00:30:00",
                            "end_time":"00:59:00"
                        }
                    ],
                    "start_timestamp":1546275661000,
                    "end_timestamp":1546275661000
                }
            }]
        }

欄位說明：

名稱         | 類型    | 說明      | 備註
-------------|-------------|-------------|------------|
status         | String    |           |    非必要欄位       |  
device_info         | JSON     |           |  非必要欄位
device_id         | String     |           |  非必要欄位
updated_at         | Long     |           |  非必要欄位
data         | JSONArray     |     放置主要訊息      |  
group_id         | String     |   指定通行策略的Group id        |  
updated_at         |   String   |      更新策略時間     |  非必要欄位
timetable_info         | JSON     |     通行策略      |  
id         |    Long  |     策略id    |  
name         | String     |   策略名稱     |  
monday ~ sunday         | JSONArray     |    通行規則，從 00:00 開始每30分鐘為一個區間(用一個數字表示)<br> * 0 表示不得通行<br> *  1 表示可以通行<br> 一共 48個數字       |  pass X不支援這些欄位
holiday         | String     |   觸發條件為"當日期在special_days出現時"     | |
special_days         | JSONArray     |   設定節日或特別日子如果當日落在special_days中則啟用holiday規則   |  |
id         | JSONArray     |   special_days的id     |  |
date         | JSONArray     |   啟用holiday規則的日期     | 格式必須為"yyyy-MM-dd", 0000開頭則為每年 |
remark    | JSONArray     |   備註     |  非必要|
monday\_period ~ holidy\_period | JSONString    |  裡面存放很多開始時間與結束時間，當組別人員在此區間內則可以通行      |  |
start_time | String     |    通行起始時間    |  |
end_time | String     |    通行結束時間    |  |
start_timestamp  | String     |    此策略開始時間    |  |
end_timestamp  | String     |    此策略結束時間    |  |

<div id="5"></div>

##5. 解除特定告警

### <font size=5 >Topic: </font><font color=#ff0000 size=5>/{partner}/company/{company-id}/device/{device-id}/warningAction</font> 

* 使用Qos : 1
* 說明：批次解除告警
* Payload範例：

        {
          "status": "ONCE",
          "connType": "connType",
          "connId": "connId",
          "path": {
            "company_id": 1,
            "device_id_at": "sn-adwefwf"
          },
          "data": {
              "trace_id": "warning trace id",
              "action_type": 2
           }
        }


欄位說明：

名稱         | 類型    | 說明      | 備註
-------------|-------------|-------------|------------|
status         | String     |           |  非必要欄位
path         | JSON     |           |  非必要欄位
company_id         | Integer     |           |  非必要欄位
device_id         | String     |           |  非必要欄位
data         | JSON     |   存放需要解除告警的告警id        |  
trace_id         | String     |     告警id     |  
action_type         | Integer     |      目前必須設置為2才能夠解除告警     |  

<div id="7"></div>

##6. 設置設備配置

### <font size=5 >Topic: </font><font color=#ff0000 size=5>/{partner}/company/{company-id}/device/{device-id}/config</font> 

* 使用Qos : 1
* 說明：重設設備配置或是讓設備向Server拉取設置
* Payload範例：

        {
          "status": "ONCE",
          "connType": "connType",
          "connId": "connId",
          "path": {
            "company_id": 1,
            "device_id": "sn-adwefwf"
          },
          "data": {
            "default_flag": true,
            "config": {
              "base": {},
              "extra": {}
            }
          }
        }

欄位說明：

目前只有default_flag被使用，但其他欄位皆須存在並代入空值，往後可供擴充

名稱         | 類型    | 說明      | 備註
-------------|-------------|-------------|-------------|
status         | String     |          |   必要欄位且可設為""
path         | JSON     |           |  必要欄位
company_id         | String     |      公司id     |  
device_id         | String     |     裝置id      |  
data         | JSON     |           |  
default_flag         | Boolean     |      是否重設裝置設定<br> 1. true : 重設裝置設定並上傳 <br> 2. false : 和Server端取得設定    |  
config         | Integer     |     擴充用      |  必要欄位
base         | JSON     |           |  必要且可設為{}
extra         | JSON     |           |  必要且可設為{}

<div id="11"></div>

##7. 下發通知

### <font size=5 >Topic: </font><font color=#ff0000 size=5>/{partner}/company/{company-id}/device/{device-id}/notify</font> 

* 使用Qos : 1
* 說明：可以主動對裝置下發特定訊息(開門)

* Payload範例：

>

    {
      "msg_id": 1,
      "status": "ALL",
      "connType": "notify",
      "connId": "connId",
      "group_info": {
        "group_id": 430,
        "updated_at": 1526633538,
      },
      "data": {
        "code": 1,
        "msg":"",   // 通知附帶資訊  
       "custom_data":{}   // obj 客戶自定義json數據
      }
    }

欄位說明：

名稱         | 類型    | 說明      |  備註
-------------|-------------|-------------|------------|
msg_id         | Integer     |           |  非必要欄位
status         | Integer     |           |  非必要欄位
group_info         | JSON     |           |  非必要欄位
group_id         | Integer     |  同Topic中的Group id  |  非必要欄位
updated_at         | Long     |           |  非必要欄位
data           | JSON   |    存放觸發開門資訊      |  
code         | Integer     |   1: 開門  <br>2: 關門  <br>201: Sync人員狀態上報  <br> |  

<div id="13"></div>

##10. 觸發遠程更新(需要File Server存放APK)

### <font size=5 >Topic: </font><font color=#ff0000 size=5>/{partner}/company/{company-id}/device/{device-id}/upgrade</font> 

* 使用Qos : 0
* 說明：會觸發裝置Call /fs/v1/upgrade_app
* Payload範例：

        {
          "connType": "upgrade",
          "connId": "connId",
          "data": {
            "type": "APP",
          }
        }
    
    
欄位說明：

名稱         | 類型    | 說明      | 備註
-------------|-------------|-------------|-------------|
connType         | String     |     非必要欄位   |  
connId         | String     |     ack用      |  非必要欄位
data         | JSONObject     |       |  
type         | String     |   固定帶入APP    |  固定帶入APP

<div id="16"></div>


