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
}

var nicks = [];

app.use(express.static(__dirname, '/css'));
app.use(express.static(__dirname, '/js'));
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});



function update(){
    io.emit('empty');
    for(var i=0;i<nicks.length;i++)
    {
        io.emit('addonline',nicks[i].name);
    }
}

var clients = [];
io.on('connection', function(socket){
    clients.push(socket);
    var address=socket.handshake.address;
    var person=-1;
    for (var i=0;i<nicks.length;i++)
    {
        if(nicks[i].addr==address)
        {
            person=i;
            break;
        }
    }

    if (person==-1)
    {
        nicks.push(new Person("",address,socket));
        person=nicks.length-1;
    }

    socket.on('chat message', function(msg){
        if (msg.charAt(0)=='/'){
            nicks[person].name = msg.substring(1,msg.length);
            update();
        }
        else{
            var currentdate=new Date();
            var a = (currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds());
            if(msg.length<100 && nicks[person].name!="" && msg!=""){
                var b = [nicks[person].name+":"+msg,a];
                console.log(nicks[i].name,nicks[i].name!=" ");
                console.log(b);
                sendmsg.sendmsg(io,b);
            }
        }
    });

    socket.on('disconnect', function () {
        var string = "user disconnected";
        console.log(string);
        var index = clients.indexOf(socket);
        if (index != -1) {
            clients.splice(index, 1);
        }
        if (person!=-1){
            nicks.splice(person, 1);
        }
        update();
    });

});

http.listen(process.env.PORT || 3000, function(){
    console.log('listening on *:3000');
});
