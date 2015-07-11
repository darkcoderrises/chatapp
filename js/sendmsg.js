function test()
{
    console.log("hi");
};

function sendmsg(io,msg)
{
    io.emit("chat message",msg);
}

module.exports.test=test;
module.exports.sendmsg=sendmsg;
