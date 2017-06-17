/**
 * Created by Sophia on 2016/11/2.
 */
var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var users = [];
var connections = [];
//房间对象有房间列表
var rooms ={
    room1:'',
    room2:''
}

server.listen(process.env.PORT || 3000);
console.log('server running...');

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index2.html')
});

app.use(express.static(path.join(__dirname, '/public')));
//sockets 所有的客户端通过connection 连接到服务器




io.sockets.on('connection', function (socket) {

    //socket 每一个连接的客户端的websocket实例
    connections.push(socket);
    console.log('Connected : %s sockets connected', connections.length);
//user没有输入用户名登录 直接关掉chat窗口 服务器端提示未登录的用户关掉了窗口 连接数-1
    socket.on('disconnect', function (data) {
        socket.on('logout',function (data) {
            io.sockets.in(data).emit(socket.username);
        })
        if (socket.username) {
            for(var i=0;i<users.length;i++){
                if(users[i].name===socket.username){
                    users.splice(i,1);
                }
            }
            console.log('user ' + socket.username + ' logout');
        }
        updateUsernames();
        connections.splice(connections.indexOf(socket), 1);
        console.log('Disconnected : %s sockets connected', connections.length);

        if(socket.roomid==='1'){
            // socket.leave('room1');
            io.sockets.in('room1').emit('goodbye',socket.username);
        }
        if(socket.roomid==='2'){
            // socket.leave('room2');
            io.sockets.in('room2').emit('goodbye',socket.username);
        }
    });
    //收到的data是用户输入的房间名
    socket.on('createchatroom',function (data) {
        if(data!=''){
            console.log(data);
            rooms.room3=data;
            console.log(rooms);
            console.log("a chat room named "+data+"has been created"+new Date());
        }else {
            console.log("room name is undefined");
            socket.emit('undefinedroomname');
        }

    })

    socket.on('send message', function (data) {
        console.log(data);
        console.log("**********************")
        console.log(socket.username);
        console.log("**********************")
        console.log("\"" + data.mymsg + "\"" + " at " + "    " + new Date());
        // io.sockets.emit('new message', {msg: data, user: socket.username});
        console.log("roomid is "+data.roomid);
        var toSocketId = data.toSocketId;
        if (toSocketId) {
            var toSocket = _.find(connections, {id: toSocketId});
            toSocket.emit('new message', {msg: data, user: socket.username});
        }
        else {
            io.sockets.in('room'+data.roomid).emit('new message', {msg: data, user: socket.username})
        }

        var scope = data.scope; // room, roomothers, all, private, allothers
        var event = data.event;

        var handler = {
            MouseMove: function(data) {},
            Click: function(data) {}
        }

        var func = handler[event];
        func && func(data);
    });

    socket.on(connections[0].id,function (data) {
        console.log("*********private*********")
        console.log("FROM")
        console.log(data.from);
        console.log("MSG")
        console.log(data.privatemsg);
        console.log("TO")
        console.log(data.to);
        console.log("*********private*********")
    })


    socket.on('new user', function (data, callback) {
        callback(true);
        //判断用户输入的名字在用户想要进入的聊天室中不存在就继续执行if中的代码
        if(deplicatename(data)!=1){
            socket.username=data.username;
            socket.roomid = data.roomid;
            var userinfo = {};
            // userinfo['roomid'] = data.roomid;
            // userinfo['name'] = data.username;
            userinfo.roomid=data.roomid;
            userinfo.name=data.username;
            userinfo.socketId = socket.id;
            users.push(userinfo);

            if(data.roomid === '1'){
                socket.join("room1");
                rooms.room1=(socket.username)
                // io.sockets.in('room1').emit('welcome', socket.username);
                io.sockets.emit('welcomeall',socket.username)
                io.sockets.emit('welcome',socket.username)
            }
            if(data.roomid === '2'){
                socket.join("room2");
                rooms.room2=(socket.username)
                io.sockets.in('room2').emit('welcome', socket.username);
            }
            updateUsernames();
            console.log('user' + ' ' + userinfo.name + ' ' + 'login to' +userinfo.roomid);
        }
    });


    function updateUsernames() {
        io.sockets.emit('get users', users)
    };
//检查用户名是否重复  如果用户输入的名字已经在用户选择的聊天室中存在 返回1 并在前台页面弹出alert提示前台关闭页面 后台输出已经存在的用户名
    function deplicatename(data) {
        if(users.length!=0){
            for(var i=0;i<users.length;i++){
                if(data.username===users[i].name && data.roomid===users[i].roomid){
                    socket.emit('duplicatename',"this name has been exist in the room");
                    console.log("duplicatename"+data.username)
                    return 1;
                }
            }

        }
    }

});



