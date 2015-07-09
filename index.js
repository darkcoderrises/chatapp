var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('./node_modules/socket.io')(http);

var nicks = new Array(1000);


for(var i=0;i<1000;i++){
    nicks[i] = new Array(2);
    nicks[i][0]=0;
}



app.use(express.static(__dirname, '/css'));


app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});



function update(){
    io.emit('empty');
    for(var i=0;i<1000;i++)
    {
        if(nicks[i][0]!=0)
        {
            io.emit('addonline',nicks[i][1]);
        }
    }
}

io.on('connection', function(socket){
    var address=socket.handshake.address;
    var name=-1;
    update();
    for (var i=0;i<1000;i++)
    {
        if (nicks[i][0]==address){
            name=nicks[i][1]
            break;
        }
    }
    if(name==-1)
    {
        for (var i=0;i<1000;i++){   
            if(nicks[i][0]==0){
                nicks[i][0]=address;
                nicks[i][1]=address;
                name=nicks[i][1];  
                break;
            }
        }
    }


    socket.on('chat message', function(msg){
        if (msg.charAt(0)=='/'){
            name = msg.substring(1,msg.length);
            for (var i=0;i<1000;i++){
                if(nicks[i][0]==address){
                nicks[i][1]=name;
                break;
                }
            }
            update();
        }
        else{
            var currentdate=new Date();
            var a = (currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds());
            if(msg.length<1000 && name!=address){
                var b = [name+":"+msg,a];
                console.log(b);
                io.emit('chat message',b);

            }
        }
    });

/*
    socket.on('disconnect', function(){
        for(var i=0;i<1000;i++){
            if(nicks[i][0]==addr){
                nicks[i][0]=0;
            }
        }
        update();
    }
*/

});

http.listen(process.env.PORT || 3000, function(){
    console.log('listening on *:3000');
});
