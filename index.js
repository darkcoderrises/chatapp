var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

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


app.get('/:room', function(req, res){
    res.sendFile(__dirname + '/index.html');
});


function update(){
    io.emit('empty');
    for(var i=0;i<nick.length;i++)
    {
        io.emit('addonline',nick[i].name,nick[i].room);
    }
}

io.on('connection', function(socket){
    var address=socket.handshake.address;
    var person=-1;

    socket.on('subscribe', function(room){
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

        console.log(room)
        nick[person].sock.join(room);
        nick[person].room=room;
    });

    socket.on('chat message', function(msg){
        if(person==-1)
            return;

        var curdate=new Date();
        var timesent = (curdate.getHours() + ":" + curdate.getMinutes() + ":" + curdate.getSeconds());

        if (msg.charAt(0)=='/'){
            console.log(person,nick[person]);
            nick[person].name = msg.substring(1,msg.length);
            update();
        }
        else
        {
            if(msg.length<100 && nick[person].name!="" && Math.abs(nick[person].time-curdate.getTime())>=100) 
            {
                var Msg = [nick[person].name+":"+msg,timesent];
                console.log(Msg,nick[person].room);
                io.sockets.in(nick[person].room).emit('chat message', Msg);
            }
        }

        nick[person].time=curdate;
    });

    socket.on('disconnect', function () {
        if(person!=-1)
        {
            nick.splice(person, 1);
            socket.leave(nick[person].room);
            update();
        }
    });

});

http.listen(process.env.PORT || 3000, function(){
    console.log('listening on *:3000');
});
