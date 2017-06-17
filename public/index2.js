
/**
 * Created by Sophia on 2016/11/7.
 */
//聊天室界面

var zww = $('#roomid').val();
console.log(zww);
var targetid='lUV2Jr5BLLTm7yVgAAAA'
var $messageArea = $('#messageArea');
//第一页  登录界面
var $chatroomArea=$('#chatroomArea');
var socket = io("ws://localhost:3000");
//输入消息Form
var $messageForm = $('#messageForm');
//输入private消息Form
var $pmessageForm = $('#pmessageForm');
//输入消息文本框
var $message = $('#message');
//聊天记录
var $chat = $('#chat');
//当前在线用户列表
var $users = $('#users');
//登录界面中的输入用户名文本框
var $username = $('#username');
//登录界面中创建房间名
var $chatroomname=$('#chatroomname');
//登出聊天室按钮
var $creatchatroom = $('#creatchatroomsubmit');
//select  下拉菜单  option  chatroom 选择
var $roomid=$('#roomid');
$logout=$('#logout');
$(function () {
  socket.on("myroomid",function (data) {
    console.log(data)
  })

  $messageForm.submit(function (e) {
    e.preventDefault();
    var params = {roomid: $('#roomid').val(), mymsg: $message.val()};
    // var selectedSocketId = 'fdsfdsf';
    // if (selectedSocketId) {
    //   params.toSocketId = selectedSocketId;
    // }
    socket.emit('send message', params);

    $message.val('');
  });
  socket.on('new message', function (data) {
    $chat.append('<div class="well"><strong>' + data.user + '</strong>' + ' ' + new Date() + '<br/>' + data.msg.mymsg + '</div>');
  });
  //private message

//发送private消息方法
  $pmessageForm.submit(function (e) {
    e.preventDefault();
    socket.emit(socket.id, {from:socket.id,privatemsg:$message.val(),to:targetid} );
    $message.val('');
    socket.on(socket.id, function (data) {
      $chat.append('<div class="well"><strong>' + data.to + '</strong>' + ' ' + new Date() + '<br/>' + data.from + +" " + data.mymsg+'</div>');
    })
    //private message finished
  });

  socket.on('get users', function (data) {
    var myroomid = $roomid.val();

    var html = '';
    if (myroomid === '1') {
      $('#rmid').html('1');
      for (var i = 0; i < data.length; i++) {
        if (data[i].roomid === '1') {
          html += '<li class="list-group-item" >' + data[i].name + '</li>';
          console.log(html)
        }
      }
    }
    if (myroomid === '2') {
      $('#rmid').html('2');
      for (var i = 0; i < data.length; i++) {
        if (data[i].roomid === '2') {
          html += '<li class="list-group-item">' + data[i].name + '</li>';
        }
      }
    }
    $users.html(html);
  });
  socket.on("welcomeall",function (data1) {
    console.log("welcomeall is running")
    $chat.append(data1)
  })
  socket.on('welcome', function (data,data2) {
    console.log(data)
    $chat.append("user " + data + " join chat room"+data2 + "<br/>");
  });
  //当用户关闭聊天室页面时 将离开用户的信息在用户所在chatroom中广播
  socket.on('goodbye', function (data) {
    $chat.append("user " + data + " left this room" + "<br/>")
  });
  //当检测到用户名在同一个聊天室已经存在时 alert信息 关闭当前页面
  socket.on('duplicatename',function (data) {
    alert(data);
  });
  //用户没有输入房间名称 直接点击创建房间 提示没有输入房间名
  socket.on('undefinedroomname',function () {
    alert('did not type name of chatroom');
  });
})

$('#submit_list').on('click', function () {
  socket.emit('new user', {roomid: $('#roomid').val(), username: $('#username').val()}, function () {
    if (true) {
      $('#chatroomArea').hide();
      $messageArea.show();
    }
  });
  $username.val('');
});


$logout.on('click',function () {

  socket.emit('logout',$('#roomid').val() );
  window.open(location, '_self').close();
});
//点击创建房间按钮后需要把用户输入的房间名发给server
$creatchatroom.on('click',function () {
  socket.emit('createchatroom',$chatroomname.val() );
  $roomid.append("<option value=$chatroomname.val()></option>");
  // $chatroomname.val('');
})
$chatroomname.val()

//点击用列表中的用户名
function getusername() {
  $("li").click(function(){
    alert($(this).text())
  })
}


