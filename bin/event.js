const ChatTypes = {
    //聊天频道
    USER_CONNECTION: 'connection',                          //建立连接
    USER_DISCONNECT: 'disconnect',                          //断开连接（彻底断开）
    USER_DISCONNECTING: 'disconnecting',                     //尚未离开房间
    USER_JOINROOM: 'joinroom',                              //加入房间
    USER_LEAVEROOM: 'leaveroom',                            //离开房间
    USER_SENDTONSP: 'sendtonsp',                            //发送至大厅
    USER_SENDTOROOM: 'sendtoroom',                          //房间内通信
    USER_SENDTOONE: 'sendtoone',                            //发送给个人
    SET_ROOM_ADMIN: 'setroomadmin',                         //设置房间管理员  
    SET_USER_FORBID: 'setuserforbid',                       //设置禁言   
    SET_USER_UNFORBID: 'setuserunforbid',                   //取消禁言  
    USER_ROOMNEWNOTICE: 'usernewroomnotice',                    //新通知
    USER_ROOMREMOVENOTICE:'userroomremovenotice',             //删除通知

    //系统管理
    SYS_ERROR: 'syserror',                                     //错误
    SYS_NOTICE_SUCCESS: 'syssuccess',                          //系统通知,成功
    SYS_NOTICE_WARNING: 'syswarning', //系统通知，警告
    SYS_NOTICE_MESSAGE: 'sysmessage', //系统通知，消息
    SYS_NOTICE_ERROR: 'syserror', //系统通知，错误

    //统计
    GET_NSP_USERS: 'getnspconnected',  //获取聊天频道内用户列表
    GET_ROOM_USERS: 'getroomusers',    //获取房间内用户列表
}

module.exports = ChatTypes;