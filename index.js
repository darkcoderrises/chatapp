var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

function Person(name,addr)
{
    this.name=name;
    this.addr=addr;
}

var LIMIT=3;

var nicks = new Array(LIMIT);

for(var i=0;i<LIMIT;i++){
    nicks[i]=new Person("",0);
}

app.use(express.static(__dirname, '/css'));
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});



function update(){
    io.emit('empty');
    for(var i=0;i<LIMIT;i++)
    {
        if(nicks[i].addr!=0 & nicks[i].name!="")
        {
            io.emit('addonline',nicks[i].name);
        }
    }
}


io.on('connection', function(socket){
    var address=socket.handshake.address;
    var person=-1;
    update();
    for (var i=0;i<LIMIT;i++)
    {
        if(nicks[i].addr==address)
        {
            person=i;
        }
        break;
    }
if(person==-1)
{
    for (var i=0;i<LIMIT;i++){   
        if(nicks[i].addr==0){
            person=i;
            nicks[i]=new Person("",address);
            break;
        }
    }
}
if(person==-1)
    socket.end();

socket.on('chat message', function(msg){
    console.log(msg);
    if (msg.charAt(0)=='/'){
        nicks[person].name = msg.substring(1,msg.length);
        update();
    }
    else{
        var currentdate=new Date();
        var a = (currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds());
        if(msg.length<100 && person.name!=""){
            var b = [nicks[person].name+":"+msg,a];
            console.log(b);
            io.emit('chat message',b);
        }
    }
});

socket.on('disconnect', function () {
    var string = "user disconnected";
    console.log(string);
    nicks[i]=new Person("",0);
    update();
});

});

http.listen(process.env.PORT || 3000, function(){
    console.log('listening on *:3000');
});
