# RESTful API  
===================
***

版本          | 修訂日期     | 修訂者        |  修訂內容     |  備註       |
-------------|-------------|-------------|-------------|-------------|
v1.0.0         | 2022/08/30    |             |  初稿|無            |

===================
***

###GET方法：

1. [ /v2/rsapub 獲取RSA加密鑰匙](#1)
2. [ /v2/device/tsl/check 檢查物模型](#2)
3. [ /v2/device/tsl/language/check 檢查物模型語言包是否存在](#3)
4. [ /v2/device/group/default 綁定默認組](#4)
5. [ /v2/image/{image_id} 獲取人員照片](#5)
6. [ /v2/config 獲取設備設定](#6)
7. [ /v2/device/info 獲取設備詳細資訊](#7)
8. [ /v2/company 獲取公司名稱](#8)
9. [ /v2/device/groups 獲取設備綁定組別的詳細資訊](#9)
10. [ /v2/server/version 獲取伺服器版本](#10)

###POST方法：

1. [ /v2/device/login 設備登入](#11)
2. [ /v2/device/register 設備註冊](#12)
3. [ /v2/user/info 獲取人員資訊](#13)
4. [ /v2/record 上傳打卡紀錄](#14)
5. [ /v2/device/alarm/report 上傳告警訊息](#15)
6. [ /v2/device/version/update 上傳設備版本相關資訊](#16)
7. [ /v2/device/upload/server/config 上傳設備設定](#17)
8. [ /v2/report/user/status 上報本地人員同步狀態異常訊息](#18)
9. [ /v2/device/report/event 上報設備狀態](#19)
10. [ /fs/v1/upgrade_app 設備升級](#20)
11. [ /v2/identify/qrcode QR Code驗證](#21)
12. [ /v2/device/tsl 上傳物模型，並綁定物模型和設備之間的關係](#22)
12. [ /v2/device/tsl/language 上傳物模型的國際化語言包](#23)

=========================
***
>##介面說明
* 採用HTTP RESTful
* 對接地址: http://HOST/sl/

>##Header相關參數

名稱         | 類型    | 說明      |  備註
-------------|-------------|-------------|------------|
AUTH-TOKEN   | String      |    裝置憑證，登入後取得       |  token-device-325:a3a4ae5509d24fa8b18124e6c4a7cc30
AUTH-TIMESTAMP         | String     |    timestamp      | 1587718548243
LDID         | String     |     軟體再設備上的唯一ID      |  
deviceSn         | String     |     設備SN      |  
product         | String     | 用來區分終端使用裝置 | 
version         | String     | 版本號 | 

>##回應通用欄位說明

名稱         | 類型    | 說明      |  備註
-------------|-------------|-------------|------------|
Code         | Integer     |    狀態碼，正常為200       |  請參考[狀態碼](#status_code)
Desc         | String     |     詳細描述，正常為ok      |  
Message         | String     |     回應訊息，正常為ok     |  
Data         | JSON     |  回應訊息主體  |  |


<div id="status_code"></div>

>##狀態碼

Code         | 說明      |  備註
-------------|-------------|-------------|
200         |     成功   |  
403 \|\| 20403       |     Token為空   |  
401         |     Token過期或驗證失敗 |  
404         |   not found|  |
409         |   DNS錯誤|  |
20498       |   帳號或密碼錯誤|  |
498         |   參數錯誤|  |
602         |   已遭刪除的設備|  |
610         |   相似人員|  |
707         |   公司名稱過期|  |
708         |   超過最大在線數|  |
630         |   已有相同的紀錄|  |
400         |   http錯誤|  |
1101         |   密碼錯誤|  |

***

#GET方法
***

<div id="1"></div>

##1. 獲取RSA加密鑰匙

### <font size=5>Path: </font><font color=#ff0000 size=5>/v2/rsapub</font> 

* 使用方法 : GET
* 說明：設備登入時會先對server請求RSA鑰匙產生AUTH_TOKEN以便之後在Header帶入

* 回應範例：

        {
            "code": 200,
            "data": {
                "empoent": "10001",
                "module":"96c5871b4fd31fb34cb9b5b854b268913219244561e8bc7094cc45c2001950b091553a7ce005c45241f6593ed5eb415ce4177c8eaf1d56dd84440c82bca0bfb8e1ebb452f7abe93e82943f1ad63e71863d7c69b003556c522b5f1aa075583f5333d295f267068cba3d2bbd97300991413b800742f22be5da76721c6a86ea2231",
                "rsa_id": "slkv2-rsaid-bgiI4J4M0Yvvz8Oq"
            },
            "desc": "",
            "message": "OK"
        }

* 回應欄位說明：

名稱         | 類型    | 說明      |  備註
-------------|-------------|-------------|------------|
epoent         | Integer     |    rsa中的e1    |  
module         | Integer     |  rsa中質數乘積      |  
rsa_id         | JSON     |    private key id       |  


#GET方法
***

<div id="2"></div>

##2. 檢測物模型是否存在

### <font size=5>Path: </font><font color=#ff0000 size=5>/v2/device/tsl/check</font> 

* 使用方法 : GET
* 說明：上傳物模型md5，Server檢查物模型是否存在，如果物模型存在，綁定物模型和設備之間的關係，如果不存在就返回不存在

* 回應範例：

        {
            "code": 200,
            "message": "OK",
            "desc": "",
            "data": {
                "flag": 0
            },
        }

* 回應欄位說明：

名稱         | 類型    | 說明      |  備註
-------------|-------------|-------------|------------|
code         | string     |   返回碼 200表示成功，其它表示失敗          |  
message      | String      |   返回描述-記錄介面執行情況說明資訊 success表示成功描述，其他表示失敗          |  
desc         | String      |             |  
data        |Object     |           |
flag        |   int         |flag=0 不存在，flag=1 存在

<div id="3"></div>
##3. 檢查物模型語言包是否存在

### <font size=5 >Path: </font><font color=#ff0000 size=5>/v2/device/tsl/language/check</font> 

* 使用方法 : GET
* 說明：檢查物模型語言包是否存在
 
* 請求範例：

        {
          "lang": "en"
        }
        
* 請求欄位說明：

名稱         | 類型    | 說明      | 備註
-------------|-------------|-------------|-------------|
lang         | String     |     物模型語言包類型：en,zh,zh-tw等      |  

* 返回範例：

        {
            "code": 200,
            "message": "OK",
            "desc": "",
            "data": {
                "flag": 1,
                "md5": "b4e1d36bace4197ecb10e99bd77dad73"
            },
        }

* 返回欄位說明：

名稱         | 類型    | 說明      | 備註
-------------|-------------|-------------|-------------|
code         | String     |     返回碼 200表示成功，其它表示失敗|
message |string|返回描述-記錄介面執行情況說明資訊 success表示成功描述，其他表示失敗|
desc|string|
data|Object |
flag|int|flag=0 不存在，flag=1 存在
md5|string|flag=0時，md5="" flag=1時， md5= "XXXXXX"

<div id="4"></div>

##4. 綁定默認組

### <font size=5>Path: </font><font color=#ff0000 size=5>/v2/device/group/default</font> 

* 使用方法 : GET
* 說明：設備登入後會發此請求，請求Server將此設備綁定默認的組別

* 回應範例：

        {
            "code": 200,
            "desc": "OK",
            "message": "OK",
            "data": ""
        }

<div id="5"></div>

##5. 獲取人員照片

### <font size=5>Path: </font><font color=#ff0000 size=5>/v2/image/1/{image_id}</font> 

* 使用方法 : GET
* 說明：當取得人員訊息後，會利用user中的avatar欄位當作{image_id}

回應說明：

* 照片檔案（二進制圖片數據流）
* 照片最小(300 x 300px)最大(500 x 500px)

<div id="6"></div>

##6. 獲取設備設定

### <font size=5>Path: </font><font color=#ff0000 size=5>/v2/config</font> 

* 使用方法 : GET
* 說明：設備登入時會發此請求拿取設備設定，使用MQTT發送config也會觸發設備發此請求

* 回應範例：

        {
             "code": 200,
            "message": "OK",
            "desc": "",
            "data": {
            "base": 
            {
                "liveness_threshold": 0.99,
                "show_custom_avatar": true,
                "door_sensor_timeout": 3,
                "verify_success_tip": "",
                "wigan_input": 5,
                "liveness": true,
                "buzzer_status": true,
                "show_user_info": "00000",
                "black_list_open": false,
                "save_elec_mode": false,
                "setup_env": 2,
                "voice_broadcast": true,
                "mode": 10,
                "show_user_name": true,
                "strong_hint": true,
                "device_run_type": 1,
                "verify_fault_tip": "",
                "gpio_a": 1,
                "gpio_b": 1,
                "wait_time": 10,
                "gpio_c": 1,
                "gpio_d": 1,
                "auto_reboot": true,
                "gpio_e": 1,
                "recognition_distance": 1.5,
                "gpio_f": 1,
                "open_interval": 5,
                "language_type": 2,
                "keep_door_open_duration": 6,
                "short_exposure": 0,
                "screen_brightness": 80,
                "welcome_tip": "",
                "open_door_type": 0,
                "verify_threshold": 0.9,
                "sound_volume": 10,
                "use_show_avatar": true,
                "standby_open": true,
                "black_list_tip": "",
                "reboot_time": "02:00:00",
                "mask_detect": false,
                "admin_pwd": "Az123567!"
            },
            "extra": {}
        },
    }

* 回應欄位說明：

名稱| 類型| 說明| 備註
-------------|-------------|-------------|------------|
device_run_type |Integer    |設備運行狀態配置，1：運行；2：停機 pass支持
mode|   Integer |核驗模式，1:刷臉或刷卡；2:刷臉且刷卡；9:人臉；10:人臉或二維碼或刷卡;
welcome_tip |String |歡迎語（視頻流介面）
verify_success_tip  |String|    提示語（驗證成功） 
verify_fault_tip    |String|    提示語（驗證失敗） 
show_user_info  |String|    識別成功頁展示的欄位，0-不顯示，1-顯示，順序為：工號、部門、職位、身份證號、自定義提示語，如：01000，表示只顯示部門，其他資訊都不顯示
liveness    |Boolean|   活體檢測，false：關true：開 
liveness_threshold  |Float| 活體檢測閾值（建議0.99）
open_door_type  |Integer|   開門方式，0：本地繼電器；1：韋根26 (8+16bit ID）；2：韋根32；3：韋根34；4：網絡繼電器;5：韋根26（24bit ID）
keep_door_open_duration |Integer|   保持開門狀態的時長，即從發出開門命令到發出關門命令的時間間隔（單位：s）取值範圍：【1，30】，默認6s 
gpio_a |Integer|   GPIO A-輸出口，1-無，2-門鈴，3-報警器
gpio_b |Integer|   GPIO B-輸出口，1-無，2-門鈴，3-報警器 
gpio_c |Integer|   GPIO C-輸出口，1-無，2-門鈴，3-報警器 
gpio_d |Integer|   GPIO D-輸入口，1-無，2-門磁，3-出門按鈕，4-消防信號
gpio_e |Integer|   GPIO E-輸入口，1-無，2-門磁，3-出門按鈕，4-消防信號 
gpio_f |Integer|   GPIO F-輸入口，1-無，2-門磁，3-出門按鈕，4-消防信號
wigan_input |Integer|   韋根輸入口，1-無，2：韋根26(8+16bit ID）；3：韋根26 （24bit ID）;4：韋根32；5：韋根34； 
buzzer_status   |Boolean|   蜂鳴器開關，false：關，true：開 
language_type   |Integer|   多語言，1：中文2：英文 3:繁體 
auto_reboot |Boolean|   自動重啟，false：關true：開
standby_open    |Boolean|   待機是否開啟
wait_time   |Integer|   取值單位秒，默認10秒，取值10-60
recognition_distance    |Float| 識別距離（單位：米）
open_interval   |Float| 二次開門時間間隔 passPro支持
use_show_avatar |Boolean|   展示識別頭像，false：關true：開 
black_list_tip  |String|    黑名單提示語 
black_list_open |Boolean|   黑名單是否開門 
mask_detect |Boolean| 是否開啟口罩識別
reboot_time |String|設備重啟時間點("12:00:00")
sound_volume|String|設備音量
show_user_name|Boolean|展示姓名false：關 true：開 
short_exposure | Integer | 防止閃爍：0:無, 50: 50Hz, 60Hz
door_sensor_timeout| Integer |門磁超時時間
show_custom_avatar|Boolean| 顯示個性化頭像
verify_threshold|Float|人臉識別閾值
screen_brightness|Integer|螢幕亮度
voice_broadcast|Boolean|是否開啟語音播報
strong_hint|Boolean|強提示
save_elec_mode|Boolean|省流模式
setup_env|Integer|保留
admin_pwd|string|預設密碼|


<div id="7"></div>

##7. 獲取設備詳細資訊

### <font size=5>Path: </font><font color=#ff0000 size=5>/v2/device/info</font> 

* 使用方法 : GET
* 說明：前往設定頁面點選設備訊息就會發送此請求

* 回應範例：

        {
		"code": 200,
		"message": "OK",
		"desc": "",
		"data": {
			"id": 1,
			"serialNumber": "",
			"name": "b",
			"location": "n",
			"description": "",
			"direction": 0,
			"deviceTypeMaxOnline": {
				"companyId": 1,
				"typeId": 0,
				"maxOnlineNum": 0,
				"serviceConfig": []
			},
			"ldid": "PEACH-a9d594ad05409dd77db27f7e89b22f99",
			"type_id": 22,
			"type_name": "PEACH",
			"user_group": [
				{
					"id": 1,
					"name": "默認組",
					"type": 1,
					"devices": [],
					"is_default": 1,
					"person_count": 0
				}
			],
			"guest_group": [
				{
					"id": 2,
					"name": "默認組",
					"type": 2,
					"devices": [],
					"is_default": 1,
					"person_count": 0
				}
			],
			"blacklist_group": [
				{
					"id": 3,
					"name": "黑名單默認組",
					"type": 5,
					"devices": [],
					"is_default": 1,
					"person_count": 0
				}
			],
			"update_at": 1661843295,
			"create_at": 1661832913,
			"door_status": 0,
			"access_control_status": 0,
			"timetable_id": 0,
			"md5": "8b5b654b2dacd89ac04c554530e021ac",
			"ext": {},
			"tsl": {}
		}
		}

* 回應欄位說明：

名稱         | 類型    | 說明      |  備註
-------------|-------------|-------------|------------|
id  |int|   設備在server上的id
name|   string  |設備名稱
location|   string| 設備位置
state   |string|    設備狀態 1:在線
description|    string  | 設備描述
direction|  int |  設備方向，0-默認，1-進，2-出
ip  |string |ip地址
ldid    |string|    設備sn
type_id |int    |設備類型
type_name   |string|設備類型名稱
user_group| group_array |人員組
guest_group|    group_array|    訪客組
blacklist_group |group_array|   黑名單組
update_at   |int    | 上次更新的時間
last_offline_time   |int    |上次離線時間

##group欄位說明

名稱         | 類型    | 說明      | 備註
-------------|-------------|-------------|-------------|
id  |int|   組別ID
name    |String|    組別名稱
type    |int    | 組別類型 1:人員組 2:訪客組 5:黑名單組
devices|    list<int>   |有哪些裝置綁定這些組
is_default  |int    |是否為默認組

##deviceTypeMaxOnline欄位說明

名稱         | 類型    | 說明      | 備註
-------------|-------------|-------------|-------------|
companyId|  int |公司id|可隨意
typeId  |int|   設備類型|可固定1
maxOnlineNum    |int|   最大在線數|可設定5000
serviceConfig   |array|可固定[]

<div id="8"></div>

##8. 獲取公司名稱

### <font size=5>Path: </font><font color=#ff0000 size=5>/v2/company</font> 

* 使用方法 : GET
* 說明：前往設定頁面點選設備訊息就會發送此請求

* 回應範例：

        {
            "code" : 200 ,
            "message" : "OK" ,
            "desc" : "" ,
            "data" : {
               "name": "xlpcompany",
                "logo": "5d282b9557360c0001bbaf74",
                "background": "5d282b9557360c0001bbaf75",
                "welcome": "xlp",
                "introduction": "PEACH",
                "threshold": 0.88,
                "language": "zh",
                "valid_from": "2019-01-01 00:00:00.0",
                "valid_to": "2045-03-31 00:00:00.0",
                "qa_level": 1
            }
        }

* 回應欄位說明：

名稱         | 類型    | 說明      |  備註
-------------|-------------|-------------|------------|
name|string |公司名    |
logo||string    |logo圖案ID   |
background|string|  背景圖案ID  |
welcome|string| 歡迎語 |
introduction|string |公司簡介   |
threshold|float |人臉識別閾值 |
language|string |語言 |
valid_from|string|  生效時間|   
valid_to|string|    失效時間    |
qa_level|int    |0表示不做品質檢測，1表示需要做品質檢測|



<div id="9"></div>

##9. 獲取設備所有組別

### <font size=5>Path: </font><font color=#ff0000 size=5>/v2/device/groups</font> 

* 使用方法 : GET
* 說明：設備登入後會發送此請求

* 回應範例：

        {
            "code" : 200 ,
            "message" : "OK" ,
            "desc" : "" ,
            "data" : {
                "user_group" : [{
                    "id" : 1 ,
                    "name" : "默認組" ,
                    "type" : 1 ,
                    "person_count" : 19988
                }],
                "guest_group" : [{
                    "id" : 2 ,
                    "name" : "訪客組" ,
                    "type" : 2 ,
                    "person_count" : 19988
                }],
                "blacklist_group": [{
                    "id" : 3 ,
                    "name" : "黑名單組" ,
                    "type" : 3 ,
                    "person_count" : 19988
                }],
                "id" : 4 
            }
        }

* 回應欄位說明：

名稱         | 類型    | 說明      |  備註
-------------|-------------|-------------|------------|
id         | Integer     |      data紀錄id     | 
user_group         | JSONArray     |     人員組      |  
id         | Integer     |     組id      |  
name         | String     |       組名    |  
type         | Integer     |     必為1-員工      | 
person_count         | Integer     |    該組人數       | 
guest_group         | JSONArray     |   訪客組        | 
id         | Integer     |     組id      | 
name         | String     |      組名     | 
type         | Integer     |      必為2-訪客     | 
person_count         | Integer     |    該組人數       | 
blacklist_group         | JSONArray     |   黑名單組        | 
id         | Integer     |     組id      | 
name         | String     |      組名     | 
type         | Integer     |      必為2-訪客     | 
person_count         | Integer     |    該組人數       | 

<div id="10"></div>

##10. 獲取伺服器版本

### <font size=5>Path: </font><font color=#ff0000 size=5>/v2/server/version</font> 

* 使用方法 : GET
* 說明：設備登入後會馬上發送此請求

* 回應範例：

        {
            "code" : 200 ,
            "message" : "OK" ,
            "desc" : "" ,
            "data" : {
                    "date": "20200611",
                    "edition": "2.3.1.0",
                    "platform": "2"
            }
        }

* 回應欄位說明：

名稱         | 類型    | 說明      |  備註
-------------|-------------|-------------|------------|
date         | String     |     Server版本發佈日期   | 
edition         | String     |     Server版本     |可帶入2.1.0.0  
platform         | String     |    平臺類型    |可帶入2  

<div id="20"></div>


#POST方法
***

<div id="11"></div>

##11. 設備登入

### <font size=5 >Path: </font><font color=#ff0000 size=5>/v2/device/login</font> 

* 使用方法 : POST
* 說明：

* 請求範例：

        {
            "account": "admin1234",
            "password": "48EFF558AD413AAF25A29227E0AFBB8977B740B297E5A1C02B3D187A5EBFEA5F770FD1D9670FCD2F0DEB0E188EC8998C8A65EC9C55253B4A6A1D4B3A09A07220CFCDBD1317547458DC3E18C0771D87B0998DA14EA21D3F17CF8C8E7D1B8F8ED497FD96E47699E78AB3300991BBE897B557E37A974D2C18815685BF969B925F72",
            "rsa_id": "slkv2-rsaid-hbmeOWrKxXn8y2Kn",
            "identifier": "PEACH",
            "duid": "STJ080101A1928000003"
    }

* 請求欄位說明：

名稱         | 類型    | 說明      | 備註
-------------|-------------|-------------|-------------|
account         | String     |   登入帳號        |  
duid         | String     |    若是收到有包含connType的欄位payload, Pass會將此欄位回傳        |  
identifier         | String     |        PEACH   |  
password |       String        |    被rsa加密後的登入密碼  |
rsa_id         | String     |   如其名      |  |

* 回應範例：

        {
        "code": 200,
        "message": "OK",
        "desc": "",
        "data": {
            "token": "token-device-1:118293dafc5549248280475095d3f5c6",
            "account": "admin1234",
            "role": 0,
            "defaultUserGroupId": 1,
            "defaultGuestGroupId": 2,
            "defaultBlackGroupId": 3,
            "threshold": 0.85,
            "device": {
                "id": 0,
                "sn": "PEACH-a9d594ad05409dd77db27f7e89b22f99",
                "name": "",
                "direction": 0,
                "location": "",
                "companyId": 0,
                "createAt": "",
                "updateAt": "",
                "active": 0,
                "description": "",
                "info": "",
                "serialNumber": "",
                "type_id": 0,
                "software_version": "",
                "ldid": "PEACH-a9d594ad05409dd77db27f7e89b22f99"
            },
            "company": {
                "id": 1,
                "name": "My Company",
                "logo": "",
                "background": "",
                "welcome": "",
                "introduction": "",
                "contact": "admin",
                "createBy": 1,
                "threshold": 0.8,
                "language": "zh",
                "create_at": "2018-12-19 20:36:34",
                "update_at": "2018-12-19 20:36:34",
                "valid_from": "2018-12-01 00:00:00",
                "valid_to": "2099-12-31 00:00:00"
            },
            "userRspVO": {},
            "newDeviceKey": true,
            "lang": "zh",
            "name": "",
            "deviceTypeMaxOnline": {
                "companyId": 1,
                "typeId": 0,
                "maxOnlineNum": 0,
                "serviceConfig": []
            },
            "account_id": 1,
            "company_id": 1
        }
        }

* ##回應欄位說明

名稱         | 類型    | 說明      | 備註
-------------|-------------|-------------|-------------|
token   |string|    就是token照舊
account|    string  | 帳號
role|   int | 角色 | 默認0
defaultUserGroupId  |int|   綁定的默認組id | 設備有時會嘗試重複登入時可以給他
defaultGuestGroupId |int|   綁定的訪客組id |
defaultBlackGroupId |int|   綁定的黑名單組id |
lang    |string |語系| 預設zh
threshold   |float  |人臉偵測閾值|預設0.88
device  | JsonObject    | 設備類型
newDeviceKey    |bool   |是否為新設備
company | JsonObject    |公司資訊
name    |string |姓名 |帶入空字串即可
userRspVO   | JsonObject    | 帶入{}即可
deviceTypeMaxOnline|    JsonObject  | 最大在線設備相關訊息
account_id| int|帳號在server上的id|可固定1
company_id| int |公司在server上的id |可固定1

##company欄位說明

名稱         | 類型    | 說明      | 備註
-------------|-------------|-------------|-------------|
id  |int    |公司ID|可固定1
name|   string  |公司名字|
logo|   string  |公司Logo id | 可帶空
background| string|背景圖id | 可帶空
welcome|    string  |歡迎語 | 可帶空 
introduction    |string|    簡介|可帶空
contact |string|    聯絡人|可帶空
createBy    |int|   創建者id|可固定1
threshold   |int|   辨識閾值|可固定0.88
language    |string|    語言|可固定zh
create_at   |string|    公司創建時間|可帶入格式2019-03-07 11:17:27.0任意值皆可
update_at   |string|    公司更新時間|可帶入格式2019-03-07 11:17:27.0任意值皆可
valid_from| string|生效時間|可帶入格式2019-03-07 11:17:27.0過去任意值皆可
valid_to    |string |失效時間|可帶入格式2099-03-07 11:17:27.0未來任意值皆可

##device欄位說明

名稱         | 類型    | 說明      | 備註
-------------|-------------|-------------|-------------|
id  |int|   設備在server上的db id
sn  |string|    設備sn
name|   string| 設備名稱
direction   |int|   設備進出方向 |可固定0
location    |string|    設備安裝位置
companyId   |string|    公司ID
createAt    |string|    創建時間|可帶入格式2019-03-07 11:17:27.0任意值皆可
updateAt    |string|    更新時間|可帶入格式2019-03-07 11:17:27.0任意值皆可
active  |int|   認證狀態|可固定1
description |string|    設備描述
info    |string|    設備訊息|
type_id |int|   設備類型 |可固定1
software_version    |string|軟體版本|可空字串
ldid    |string|    設備sn|

##deviceTypeMaxOnline欄位說明

名稱         | 類型    | 說明      | 備註
-------------|-------------|-------------|-------------|
companyId|  int |公司id|可隨意
typeId  |int|   設備類型|可固定1
maxOnlineNum    |int|   最大在線數|可設定5000
serviceConfig   |array|可固定[]

<div id="12"></div>


##12. 設備註冊

### <font size=5 >Topic: </font><font color=#ff0000 size=5>/v2/device/register</font> 

* 使用方法 : POST
* 說明：發出登入請求後，得到newDeviceKey為true時會到註冊頁面，使用者填完資料後會送出此請求

* 請求範例：

        {
            "direction": 0,
            "location": "test",
            "name": "test",
        }

* 請求欄位說明：

名稱         | 類型    | 說明      | 備註
-------------|-------------|-------------|-------------|
direction         | Integer     |    設備方向（0-默認，1-進，2-出）     |   
location         | String     |    設備地點      |  
name         | String     |        設備名稱   |  

* 回應範例：

        {
            "code": 200,
            "message": "OK",
            "desc": "",
            "data": {
                "id": 3,
                "sn": "PEACH-d3e721584d6a616d2bebede3346a1578",
                "name": "ddd",
                "direction": 0,
                "location": "tec",
                "companyId": 1,
                "createAt": "2020-07-09 18:03:52",
                "updateAt": "2020-07-09 18:03:52",
                "active": 1,
                "description": "",
                "info": "",
                "serialNumber": "",
                "type_id": 19,
                "software_version": "",
                "ldid": "PEACH-d3e721584d6a616d2bebede3346a1578"
            }
        }

* 回應欄位說明：

名稱         | 類型    | 說明      | 備註
-------------|-------------|-------------|-------------|
id| int |設備在server的id  
sn| string| device sn
name    |string|    設備名稱
direction   |int|   設備方向（0-默認，1-進，2-出）  
companyId   |int|   公司ID
createAt    |string|    設備創建時間戳
updateAt    |string|    設備更新時間戳  
active  |int|   認證狀態|可固定1
description |string |設備描述
info    |string|    其他資訊
type_id|    int |設備類型id|可固定19
software_version|   string  |軟體版本
ldid    |string |device sn

<div id="13"></div>

##13. 獲取人員資訊

### <font size=5 >Path: </font><font color=#ff0000 size=5>/v2/user/info</font> 

* 使用方法 : POST
* 說明：向server請求特定user id的詳細資料

* 請求範例：

        {
            "model_version": "使用Model的版本",
            "user_ids": [1111,2222,3333]
        }

* 請求欄位說明：

名稱         | 類型    | 說明      | 備註
-------------|-------------|-------------|-------------|
model_version         | String     |   使用Model的版本       |  不是很重要
user_ids         | Integer[]     |    人員的id       |  最多一次兩萬筆

* 回應範例：

        {
            "code": 200,
            "message": "OK",
            "desc": "",
            "data": [{
                "avatar": "5c809a6dbac9be0001d4ce6e",
                "feature": "",
                "type": 1,
                "permission": "",
                "prompt": "",
                "birthday": "1982-07-23",
                "mobile": "18622625638",
                "remark": "AddUser",
                "position": "",
                "location": "",
                "mail": "",
                "gender": 1,
                "user_id": 124,
                "user_name": "劉嵐寶",
                "avatar_show": "",
                "company_id": "1",
                "ic_number": "",
                "id_number": "luTIw8ndGlg1qVE8AG9D2exAF/khYKPx",
                "model_version": "30017",
                "created_at": 1551932013,
                "updated_at": 1565757461,
                "date_time_from": 1483200000,
                "date_time_to": 1483200000,
                "job_number": "",
                "reception_user_id": 0,
                "phone_suffix": "",
                "entry_time": 0,
                "country_code": "",
                "place_code": "",
                "staff_type": 0,
                "add_channel": 4,
                "guest_company": "",
                "guest_purpose": "",
                "area_code": "86",
                "guest_level": "",
                "department_id": 0,
                "department_name": "",
                "guest_auth_status": 1
                }
             ]
        }

* 回應欄位說明：

名稱         | 類型    | 說明      | 備註
-------------|-------------|-------------|-------------|
avatar         | String     |   人臉圖片id       |  
feature         | String     |   特徵值(可代空)       |  
type         | String     |  用戶類型: 1-員工, 2-訪客 3-黑名單      |  
permission         | Integer     |   通行權限: 0-可通過, 1-不可通過      |  
prompt         | String     |  個性化提示      |  
user_id         | String     |   人員id      |  
user_name         | String     |   人員名       |  
ic_number         | String     |   ic卡號      |  
id_number         | String     |   身分證號碼      |  
model_version         | String     |   使用Model的版本       |  
created_at         | String     |   創建時間      |  
updated_at         | String     |   更新時間      |  
date\_time\_from         | String     |  開始時間       |  
date\_time\_to         | String     |   結束時間       |  
job_number         | String    |    人員工號       |  
mobile| String  |手機 |
remark  |String|    備註  |
position|   String  |職位 |
location    |String |座位號碼   |
mail    |String |mail|  
gender  |Integer    |性別，0-未知，1-女，2-男    |
avatar_show |String|    形象照ID   |
company_id| Integer|    公司ID    |
reception\_user\_id |Integer    |接待訪客的用戶id|
phone_suffix    |String |手機國碼   |
entry_time  |Long   |入職時間   |
country_code|   String| 國家號碼    |
place_code| String| 郵遞區號    |
staff_type  |Integer    |員工類型， 1.員工；2.實習生；
add_channel|    Integer|    永遠為1|
guest_company|  String| 訪客公司    |
guest_purpose   |String |來訪意圖   |
area_code   |String |預設886|
guest_level|    Integer|    訪客等激    |
department_id   |Integer    |部門id   |
department_name|String  |部門名稱   |
guest\_auth\_status|    Integer|    永遠為1|

<div id="14"></div>

##14. 上傳打卡紀錄

### <font size=5 >Path: </font><font color=#ff0000 size=5>/v2/record</font> 

* 使用方法 : POST
* 說明：當辨識臉後，設備將發出此請求

* 請求範例：

        {
            "abnormal_type": 0,
            "body_temperature": 0,
            "data_tag": "0",
            "database_id": 10,
            "entry_mode": 1,
            "extension" : 0,
            "ic_number": "",
            "in_time": 0,
            "mask": 0,
            "mode": 9,
            "push_option": 0,
            "rectangle": [
                {
                    "x": 169,
                    "y": 628
                },
                {
                    "x": 427,
                    "y": 887
                }
            ],
            "sign_avatar": "base64字串",
            "sign_bg_avatar": "base64字串",
            "heat_avatar":"base64字串",
            "sign_time": 1594369317,
            "type": 1,
            "user_id": 1,
            "user_name": "andy",
            "verify_score": 0.9507887
        }

* 請求欄位說明：

名稱         | 類型    | 說明      | 備註
-------------|-------------|-------------|-------------|
user_id |int    |用戶ID   
user_name   |string|        用戶名 
abnormal_type   |int|識別記錄異常類型；0-無;10001-人證不匹配;10002-人卡不匹配;10003-人碼不匹配;20001-訪客不在有效期內;20002-不在通行時間內；30001-無效身份證; 30002-無效IC卡;30003-無效二維碼;40001-體溫異常；50001-未帶口罩；90001-不在有效期限內
sign_avatar |string |   打卡圖片 base64 string
sign\_bg_avatar|    string  |  背景圖片 base64 string
doc_photo|  string  |   身分證圖 base64 string
sign_time   |int    |打卡時間，秒級timestamp   
type|   int |   用戶類型： 1-員工, 2-訪客, 3-陌生人, 4-非活體
id_number   |string |   身分證號碼(DES加密後)
ic_number   |string |   IC卡號    
id_info |string |   身分證其他資訊（Json串）
mode|   Integer|    設備上的辨識模式1:刷臉或刷卡；2:刷臉且刷卡；3:刷臉或刷身份證；4:刷臉且刷身份證；5:刷臉且刷身份證預約；6:刷臉或掃碼； 7:刷臉且掃碼；8:藍牙；9:人臉；10:人臉或二維碼或刷卡；11：刷身份證
in_time |int    |   是否使用裝置的時間作為打卡|
entry_mode  |Integer    |   核驗方式 1、刷臉；2、二維碼；3、刷卡；4：刷臉+刷卡；5：刷身份證；6：刷臉且刷身份證；7：刷臉且刷身份證預約；8：刷臉且掃碼：9：藍牙；default：1
rectangle   |List   |   人臉框左邊，僅包含兩個頂點，第一個為左上角座標，第二個為右下角座標
x   |Integer    |   二維圖像x座標. 注意：坐標系與輸入圖像相同
y|  Integer |   二維圖像y座標. 注意：坐標系與輸入圖像相同
push_option |Integer    |   是否推送記錄，1、推送， 0不推送。默認不推送。
verify_score    |float  |   識別分數    
body_temperature    |double|    體溫| 
mask|   int |   是否佩戴口罩，0 未傳，1 未戴，2 佩戴
remark  |string |   備註  
heat_avatar|string  |   熱力圖，base64串，傳輸前需要壓縮
data_tag | string | 班別的datatag
<font color=#ff0000>extension</font> | Integer | <font color=#ff0000>外接裝置(不包含熱成像), 0:無, 1:控制器</font>
    

* 回應範例：

        {
            "code": 200,
            "desc": "OK",
            "message": "OK",
            "data": {
                "record_id":123
            }
        }

* 回應欄位說明：

名稱         | 類型    | 說明      | 備註
-------------|-------------|-------------|-------------|
record_id         | Long     |     人員紀錄id    |  


<div id="15"></div>

##15. 上傳告警訊息

### <font size=5 >Path: </font><font color=#ff0000 size=5>/v2/device/alarm/report</font> 

* 使用方法 : POST
* 說明：告警時發此請求

* 請求範例：

        {
          "trace_id": "connType",
          "description": "connId",
          "code": "10001,
          "event_time" : 75828652,
          "status": ,
          "alarm_photo", "",
        }

* 請求欄位說明：

名稱         | 類型    | 說明      | 備註
-------------|-------------|-------------|-------------|
trace_id         | String     |   告警UUID由系統生成       |  
description         | String     |    告警描述        |  非必要
code         | Integer     |        校正編碼10001表示拆機校正，10002表示強制開門校正，10003表示門磁超時復位，10004密碼攻擊錯誤，10005藍牙功耗過低，10006熱成像儀連接異常，20001表示攝像頭污染，20002表示非活體 攻擊，20003表示消防措施，新介入上報必傳40001提取特徵失敗   |  
event_time |       Long        |     毫秒timestamp
status         | Integer     |   告警上報事件，1為發生告警，2為告警解除失敗，3為告警解除成功     |  
alarm_photo         | String(base64)     |   告警圖片     |  

* 回應範例：

        {
            "code": 200,
            "desc": "OK",
            "message": "OK",
            "data": {}
        }

<div id="16"></div>

##16. 上傳設備版本相關資訊

### <font size=5 >Path: </font><font color=#ff0000 size=5>/v2/device/version/update</font> 

* 使用方法 : POST
* 說明：登入後會發此請求
* 
* 請求範例：

        {
   			"apk_version_name": "",
    		"rom_hardware_version": "V.011",
    		"apk_version_code": "",
    		"package_name": "1.4.3-0-genric",
    		"model": "ST112-1",
   			"serial_number": "STJ080101A1928000003",
   			"rom_software_version": "FT9361-R-1.4.3-0-generic",
			"manufacturer": "",
			"name": "",
			"location": "",
			"device_login_status": 1
}

* 請求欄位說明：

名稱         | 類型    | 說明      | 備註
-------------|-------------|-------------|-------------|
apk\_version\_name      | String     |   app版本號碼       |  
rom\_hardware\_version         | String     |   rom硬體版本       | 
apk\_version\_code         | String     |   app build號  |  
package_name |       String        |     包名
model         | String     |  產品型號 |  
serial_number         | String    |  device sn     |  
rom\_software\_version         | String   |   rom軟體版本     |  
manufacturer         | String     |  製造商     |  

<div id="17"></div>

##17. 上傳設備設定

### <font size=5 >Path: </font><font color=#ff0000 size=5>/v2/device/upload/server/config</font> 

* 使用方法 : POST
* 說明：當設備被本地端設置後，會發此請求，請求內部會分成config與spse兩大欄位元，config為全部設定，spse則為帶入裝置擁有的設置

* 請求範例：

        {
            "spsx": {
                "device_run_type": 1,
                "use_mode": 3,
                "mode": 10,
                "welcome_tip": "",
                "verify_success_tip": "",
                "verify_fault_tip": "",
                "show_user_info": "00000",
                "liveness": true,
                "liveness_threshold": 0.9900000095367432,
                "verify_threshold": 0.8999999761581421,
                "face_width": 0,
                "open_door_type": 0,
                "keep_door_open_duration": 6,
                "gpio_a": 1,
                "gpio_b": 1,
                "gpio_c": 1,
                "gpio_d": 1,
                "gpio_e": 1,
                "gpio_f": 1,
                "wigan_input": 5,
                "buzzer_status": true,
                "language_type": 3,
                "auto_reboot": true,
                "reboot_time": "02:00:00",
                "standby_open": true,
                "wait_time": 10,
                "recognition_distance": 1.5,
                "network_relay_address": "127.0.0.1",
                "open_interval": 5,
                "use_show_avatar": true,
                "show_user_name": true,
                "black_list_tip": "",
                "black_list_open": false,
                "certificate_threshold": 0.6000000238418579,
                "voice_broadcast": true,
                "save_elec_mode": false,
                "door_sensor_timeout": 3,
                "show_custom_avatar": true,
                "setup_env": 2,
                "strong_hint": true,
                "short_exposure": 0,
                "screen_brightness": 80,
                "sound_volume": 10,
                "mask_detect": false,
                "no_access_without_mask": false,
                "is_device_local_config": true,
                "admin_pwd": "Az123567!"
            },
            "config": {
                "device_run_type": 1,
                "use_mode": 3,
                "mode": 10,
                "welcome_tip": "",
                "verify_success_tip": "",
                "verify_fault_tip": "",
                "show_user_info": "00000",
                "liveness": true,
                "liveness_threshold": 0.9900000095367432,
                "verify_threshold": 0.8999999761581421,
                "face_width": 0,
                "open_door_type": 0,
                "keep_door_open_duration": 6,
                "gpio_a": 1,
                "gpio_b": 1,
                "gpio_c": 1,
                "gpio_d": 1,
                "gpio_e": 1,
                "gpio_f": 1,
                "wigan_input": 5,
                "buzzer_status": true,
                "language_type": 3,
                "auto_reboot": true,
                "reboot_time": "02:00:00",
                "standby_open": true,
                "wait_time": 10,
                "recognition_distance": 1.5,
                "network_relay_address": "127.0.0.1",
                "open_interval": 5,
                "use_show_avatar": true,
                "show_user_name": true,
                "black_list_tip": "",
                "black_list_open": false,
                "certificate_threshold": 0.6000000238418579,
                "voice_broadcast": true,
                "save_elec_mode": false,
                "door_sensor_timeout": 3,
                "show_custom_avatar": true,
                "setup_env": 2,
                "strong_hint": true,
                "short_exposure": 0,
                "screen_brightness": 80,
                "sound_volume": 10,
                "mask_detect": false,
                "no_access_without_mask": false,
                "is_device_local_config": true,
                "admin_pwd": "Az123567!"
            }
        }

* config中欄位說明：

名稱| 類型| 說明| 備註
-------------|-------------|-------------|------------|
device_run_type |Integer    |設備運行狀態配置，1：運行；2：停機 pass支持
mode|   Integer |核驗模式，1:刷臉或刷卡；2:刷臉且刷卡；9:人臉；10:人臉或二維碼或刷卡;
welcome_tip |String |歡迎語（視頻流介面）
verify_success_tip  |String|    提示語（驗證成功） 
verify_fault_tip    |String|    提示語（驗證失敗） 
show_user_info  |String|    識別成功頁展示的欄位，0-不顯示，1-顯示，順序為：工號、部門、職位、身份證號、自定義提示語，如：01000，表示只顯示部門，其他資訊都不顯示
liveness    |Boolean|   活體檢測，false：關true：開 
liveness_threshold  |Float| 活體檢測閾值（建議0.99）
open_door_type  |Integer|   開門方式，0：本地繼電器；1：韋根26 (8+16bit ID）；2：韋根32；3：韋根34；4：網絡繼電器;5：韋根26（24bit ID）
keep_door_open_duration |Integer|   保持開門狀態的時長，即從發出開門命令到發出關門命令的時間間隔（單位：s）取值範圍：【1，30】，默認6s 
gpio_a |Integer|   GPIO A-輸出口，1-無，2-門鈴，3-報警器
gpio_b |Integer|   GPIO B-輸出口，1-無，2-門鈴，3-報警器 
gpio_c |Integer|   GPIO C-輸出口，1-無，2-門鈴，3-報警器 
gpio_d |Integer|   GPIO D-輸入口，1-無，2-門磁，3-出門按鈕，4-消防信號
gpio_e |Integer|   GPIO E-輸入口，1-無，2-門磁，3-出門按鈕，4-消防信號 
gpio_f |Integer|   GPIO F-輸入口，1-無，2-門磁，3-出門按鈕，4-消防信號
wigan_input |Integer|   韋根輸入口，1-無，2：韋根26(8+16bit ID）；3：韋根26 （24bit ID）;4：韋根32；5：韋根34； 
buzzer_status   |Boolean|   蜂鳴器開關，false：關，true：開 
language_type   |Integer|   多語言，1：中文2：英文 3:繁體 
auto_reboot |Boolean|   自動重啟，false：關true：開
standby_open    |Boolean|   待機是否開啟
wait_time   |Integer|   取值單位秒，默認10秒，取值10-60
recognition_distance    |Float| 識別距離（單位：米）
open_interval   |Float| 二次開門時間間隔 passPro支持
use_show_avatar |Boolean|   展示識別頭像，false：關true：開 
black_list_tip  |String|    黑名單提示語 
black_list_open |Boolean|   黑名單是否開門 
mask_detect |Boolean| 是否開啟口罩識別
reboot_time |String|設備重啟時間點("12:00:00")
sound_volume|String|設備音量
show_user_name|Boolean|展示姓名false：關 true：開 
short_exposure | Integer | 防止閃爍：0:無, 50: 50Hz, 60Hz
door_sensor_timeout| Integer |門磁超時時間
show_custom_avatar|Boolean| 顯示個性化頭像
verify_threshold|Float|人臉識別閾值
screen_brightness|Integer|螢幕亮度
voice_broadcast|Boolean|是否開啟語音播報
strong_hint|Boolean|強提示
save_elec_mode|Boolean|省流模式
setup_env|Integer|AE模式
admin_pwd|string|預設密碼
<div id="18"></div>

##18. 上報本地人員同步狀態異常訊息

### <font size=5 >Path: </font><font color=#ff0000 size=5>/v2/report/user/status</font> 

* 使用方法 : POST
* 說明：同步完人員後會發送此請求告知同步狀態
* 
* 請求範例：

        {
          "action" : 0,
          "status_list": [
                {
                    "status": 1,
                    "user_ids":[1,2]
                },
                {
                    "status": 2,
                    "user_ids":[3]
                }
          ],
          "verify_model_version": "1.0.0",
          "total_user_count": 3,

        }

* 請求欄位說明：

名稱         | 類型    | 說明      | 備註
-------------|-------------|-------------|-------------|
action      | Integer     |   0-設備全量人員狀態上傳，1-上傳設備異常人員狀態上傳   |  
status_list      | JSONArray     |   有問題的人員資訊       |  
status      | Integer     |  <font color=#ff0000>1-同步中，2-特徵正常，3-圖片下載失敗，4-圖片解析失敗，5-特徵提取失敗</font>        |  
user_ids      | IntegerArray     |   人員id      |  
verify\_model\_version         | String     |   Model版本       | 
total\_user\_count         | Integer     |   總共下發人數  |  


* 回應範例：

        {
            "code": 200,
            "desc": "OK",
            "message": "OK",
            "data": {}
        }



<div id="19"></div>

##19. 上報設備狀態

### <font size=5 >Path: </font><font color=#ff0000 size=5>/v2/device/report/event</font> 

* 使用方法 : POST
* 說明：當部分狀態改變時裝置會發出
* 
* 請求範例：

        {
          "type": 1,
          "content": {
                .....
          },
        }

* 請求欄位說明：

名稱         | 類型    | 說明      | 備註
-------------|-------------|-------------|-------------|
type      | Integer     |  事件類型，1-門磁事件；2-藍牙電量;3-熱成像儀狀態;99-保全設定狀態      |  
content   | JSON     |   事件對應內容，不同的Type下有不同的Content     | 

* content說明

###tpye = 1的content

名稱         | 類型    | 說明      | 備註
-------------|-------------|-------------|-------------|
status      | Integer     |   事件狀態，1-開，2-關，3-無     |  
timestamp        | long     |   事件發生時間，毫秒級     | 

###tpye = 2的content
名稱         | 類型    | 說明      | 備註
-------------|-------------|-------------|-------------|
power      | Integer     |    剩餘電量，0-100    |  

###tpye = 3的content
名稱         | 類型    | 說明      | 備註
-------------|-------------|-------------|-------------|
status         | Integer     |   熱成像事件狀態，0-未知，1-已連接，2-未連接    | 

###tpye = 99的content
名稱         | 類型    | 說明      | 備註
-------------|-------------|-------------|-------------|
status      | Integer     |   事件狀態，1-開，2-關    |  
timestamp        | long     |   事件發生時間，毫秒級     | 

* 回應範例：

        {
            "code": 200,
            "desc": "OK",
            "message": "OK",
            "data": {}
        }


<div id="20"></div>

##20. 設備升級

###<font size=5 >Path: </font><font color=#ff0000 size=5>/fs/v1/upgrade_app （不會帶Header）</font> 

* 使用方法 : POST
* 說明：
* 請求範例：

        {
            "device_id": "SPS020STDC19G09080",
            "model": "SPS020-STD",
            "hardware_version": "SPS020V3",
            "software_version": "V2.3.7_20200407-164006",
            "timestamp": "1594289039481",
            "sign": "22372e5d681d811aa5f759225b8551d8"
        }

* 請求欄位說明：

名稱         | 類型    | 說明      | 備註
-------------|-------------|-------------|-------------|
device_id      | String     |     設備SN |  如果server版本較舊或是讀取不到則不會帶此欄位
model      | String     |    設備model  |  
hardware_version      | String     |     硬體版本 |  
software_version      | String     |     軟體版本 |  
timestamp      | String     |  更新發起時間    |  
sign      | String     |  將其他Key Value轉換成字串並md5加密    | 其實這不重要因為過去是http才需要檢查 

* 回應範例：

        {
            "code": 404,
            "data": {
                "is_upgrade": 0,
                "title": "title",
                "detail_cn": "detail",
                "detail_en": "detail",
                "hardware_version": "",
                "software_version": "",
                "size": 0,
                "md5": "",
                "download_url": "",
                "type": 0,
                "level": 0,
                "timing": "",
                "ext": ""
            },
            "desc": "model not exist!",
            "message": "NotFound"
        }

名稱         | 類型    | 說明      | 備註
-------------|-------------|-------------|-------------|
is_upgrade         | Integer     |   是否要更新   | 
title         | String     |   跳出提示的標題   | 可以設任意字串
detail_cn         | String     |   跳出提示的內容(中)   | 可以設任意字串
detail_en         | String     |   跳出提示的內容(英文)   | 可以設任意字串
hardware_version         | String     |  硬體版本 | 就是request的hardware_version
software_version         | String     |   跳出提示的標題   | 就是request的software_version
size         | Integer     |   File server上準備更新的apk size (KBytes)   | 
md5         | String     |   File server上準備更新的apk md5   | 
download_url         | String     |   File server上準備更新的apk的路徑   | 可以設任意字串
type         | Integer     |   固定為1   | 
level         | Integer     |   固定為2   | 
timing | String |固定空字串|
ext | String | 擴充用，固定空字串|

<div id="21"></div>

##21. QR Code驗證

###<font size=5 >Path: </font><font color=#ff0000 size=5>/v2/identify/qrcode</font> 

* 使用方法 : POST
* 說明：
* 請求範例：

        {
            "content": "012as093asc23r4esrgswt3r32ec",
            "timestamp": 1234567890123
        }

* 請求欄位說明：

名稱         | 類型    | 說明      | 備註
-------------|-------------|-------------|-------------|
content      | String     |  QR Code內容    |  您可以自己給Qr Code內容加密產生
timestamp      | Long     |    13碼的時間戳  |  

* 回應範例：

        {
            "code": 200,
            "message": "OK",
            "desc": "",
            "data": {
                "timestamp": 1234567890123,
                "sign": "3d5e9da8b9f51c3fc9441971f14890ed",
                "type": 1,
                "user_id": 1,
                "user_name": "劉帆",
                "entry_status": 1,
                "entry_hint": "今天減肥了嗎",
                "user_card_id": "666",
                "user_image": {
                    "format": "",
                    "data": "",
                    "url": ""
                },
                "entry_time_left": 1,
                "id_number": "OIBrNqZEReH3nJ/oa+0oqTqMEUIO5GYU"
            }
        }
        
        
名稱         | 類型    | 說明      | 備註
-------------|-------------|-------------|-------------|
user_id|    Intger  |用戶id   
user_name   |String|    用戶名 
entry_status|   Integer|    1:通過, 請參考
entry_hint  |String|    提示語(目前不會顯示,可帶空字串
user_image  | JSONObject|   人員照片, 請參考
user\_card_id   |String | 韋根門禁卡ID
timestamp|  long    |端請求的timestamp直接回丟
sign|   string  |sign key |sign=md5(entry_status+"-"+timestamp+"-"+deviceLDID+"-"+pass\_rule\_type)
entry\_time_left|   int |剩餘通行次數 |端裝置不會使用也不會紀錄
type|   int|    人員類型，1:人員,2:訪客,3:黑名單
id_number   |String |身分證號碼  | 可以帶空
pass\_rule\_type|int | 通行規則 | 固定 0

* user_image欄位說明：

名稱         | 類型    | 說明      | 備註
-------------|-------------|-------------|-------------|
format| String  |圖片類型，值為：IMAGE\_UNKNOWN, IMAGE\_JPEG, IMAGE\_PNG, IMAGE\_BMP, IMAGE\_TIFF, IMAGE\_GIF
data    |String |人員圖片的base64
url|    String  |圖片網路位置, 有帶入上述data可以不用傳


* entry_status 說明：

名稱         | 說明    | 
-------------|-------------|
1   |可通行
2   |Qr Code不合法
3   |Qr Code解析失敗
4   |Qr Code內容有誤
5   |Qr Code無效
6   |Qr Code不在有效期限內
7   |Qr Code無通行次數
8   |Qr Code內的人員無效


<div id="22"></div>


##22. 上傳物模型，並綁定物模型和設備之間的關係

### <font size=5 >Path: </font><font color=#ff0000 size=5>/v2/device/tsl</font> 

* 使用方法 : POST
* 說明：上傳物模型，並綁定物模型和設備之間的關係
 
* 請求範例：

        {
            "content":"請參考物模型檔案"
        }

* 返回範例：

        {
             code": 200,
            "message": "OK",
            "desc": "",
            "data": {}
        }

* 返回欄位說明：

名稱         | 類型    | 說明      | 備註
-------------|-------------|-------------|-------------|
code         | String     |     返回碼 200表示成功，其它表示失敗      |  
message         | String     |     返回描述-記錄介面執行情況說明資訊 success表示成功描述，其他表示失敗      | 
desc            |       string          |   
data        |Object

<div id="23"></div>
##23. 上傳物模型的國際化語言包

### <font size=5 >Path: </font><font color=#ff0000 size=5>/v2/device/tsl/language</font> 

* 使用方法 : POST
* 說明：上傳物模型的國際化語言包
 
* 請求範例：

        {
            "lang" : "zh-tw",
            "content":"請參考物模型檔案"
        }

* 請求欄位說明：

名稱         | 類型    | 說明      | 備註
-------------|-------------|-------------|-------------|
lang         | String     |     語言：en,zh,zh-tw等      |  
content         | String     |     語言包的內容     | 

* 返回範例：

        {
             code": 200,
            "message": "OK",
            "desc": "",
            "data": {}
        }

* 返回欄位說明：

名稱         | 類型    | 說明      | 備註
-------------|-------------|-------------|-------------|
code         | String     |     返回碼 200表示成功，其它表示失敗      |  
message         | String     |     返回描述-記錄介面執行情況說明資訊 success表示成功描述，其他表示失敗      | 
desc            |       string          |   
data        |Object



