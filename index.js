var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var sendmsg = require("./js/sendmsg");

function Person(name, addr,socket)
{
    this.name=name.replace(/ /g,"");
    this.addr=addr;
    this.sock=socket;
    this.time=new Date().getTime();
}

var nick = [];

app.use(express.static(__dirname, '/css'));
app.use(express.static(__dirname, '/js'));
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});



function update(){
    io.emit('empty');
    for(var i=0;i<nick.length;i++)
    {
        io.emit('addonline',nick[i].name);
    }
}

io.on('connection', function(socket){
    var address=socket.handshake.address;
    var person=-1;
    for (var i=0;i<nick.length;i++)
    {
        if(nick[i].addr==address)
        {
            person=i;
            break;
        }
    }

    if (person==-1)
    {
        nick.push(new Person("",address,socket));
        person=nick.length-1;
    }

    nick[person].sock=socket;

    socket.on('chat message', function(msg){
        var curdate=new Date();
        var timesent = (curdate.getHours() + ":" + curdate.getMinutes() + ":" + curdate.getSeconds());
        
        if (msg.charAt(0)=='/'){
            nick[person].name = msg.substring(1,msg.length);
            update();
        }
        else
        {
            if(msg.length<100 && nick[person].name!="" && Math.abs(nick[person].time-curdate.getTime())>=100) 
            {
                var Msg = [nick[person].name+":"+msg,timesent];
                console.log(Msg);
                sendmsg.sendmsg(io,Msg);
            }
        }
        
        nick[person].time=curdate;
    });

    socket.on('disconnect', function () {
        if (person!=-1){
            nick.splice(person, 1);
        }
        update();
    });

});

http.listen(process.env.PORT || 3000, function(){
    console.log('listening on *:3000');
});
