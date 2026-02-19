const http = require("http");
const fs = require("fs");
const path = require("path");
const { Server } = require("socket.io");

const SECRET_KEY = "ZoJ3#$l"WcAW;A^s4m>f2aU.)|j[VY<+nloGRzI:8PLrIh2Fn5KD3g8^308,h)D4++Fc.Ad-L">ebkN[:vx%mww/YvnL85;WGI@@LiCz9.,lTPu2&V#}&5hCH:0EPd=O]x|^4oY,!RK3B*J}o#&e^hZ(u:c,,1,vNpp}u^2S5S!pA;&R}o:URs.?r1e_0RR'W<Z)<>xkY^@[c{i_^1=Iz^25,UjqI[.+VwI1ksRO+xhF>xdMuk?m\1v$"!r+w#-6s2lkoA:J_mW?i]rdF3xF+E7@SPGkDcmi8f*_]x$m/[p(BQVvC?Zl--cL/QH&L,DNo}U[)pd"bMy|->J;a|&27RBPm#{|<NG&<UqWS0JVIB9bf2T$(z#{NkQ5ds%Edk}GY|qYbMaZ$A;rh'`Vg#)^3@\vA-&Z_USAnhv,,cju9y`v",AtcV|*\&d"L8i`z%T@zX)(g+]J`Xke:.Keq(uBI=fe(WSw1Z0\#+uD1-*1=7HK(&2Q\&ohvV"5wX[VU%WID=Dt$VA7LMJZ)k::i1X\k"atZyk)pMR.M!_g6$U7'?rvXhBqxsDGUW9RwpPYMhTckOPi|S*[O8Srg:0Y/z[5GR}w=27PM=mm(qemV3%](https://www.google.com/search?q=O8Srg:0Y/z%5B5GR%7Dw%3D27PM%3Dmm\(qemV3%25)B@wE%dqwBLJ"o%a)"PptEz]YT+[+SvCf:xjAWI076,u'V1A('SXiHuH\*\#\<=ID^MT?mI7nL\\G\>RXQ]-=hc"J\>EPXUZvR\*\*U3bC\<,)%oIE.+OqP10dMrSV%)**PK6T5phN2\RR<.kwsG/{DY_rXxUz{#5yPmc0W{AwU6}x9}aZ-ZCNh.@=k52=SU>ZH6t],Ohu/Z#6[j<|diEbNATMLW,U'XdBub6GYB03;CfH|4B;"V+7;LBSlEy%:SZ9%)3?X$!x.XczL%ud3L|Z18R],Z?+FW)@9`0WxNvDu2(ImK+gXVt!MZUb>fGN"3S$ZBn[y"vdOJqW=OgZuMf){Qt(=$zEXD9]c\_%DcugqYaHT}3}xz(x1*Bo;80vI\#T\#'Uc-OVmc25qzqO0Nz3O]XV$`"
const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
    // SECURITY: ModHeader check for the HTML Dashboard
    if (req.headers['modheader'] !== SECRET_KEY) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
    }

    // Serve the Dashboard
    if (req.url === "/" || req.url === "/index.html") {
        fs.readFile(path.join(__dirname, "index.html"), (err, data) => {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    }
});

const io = new Server(server, { cors: { origin: "*" } });

// WebSocket Security
io.use((socket, next) => {
    if (socket.handshake.headers['modheader'] === SECRET_KEY) return next();
    next(new Error("Auth error"));
});

io.on("connection", (socket) => {
    socket.on("register", (role) => socket.join(role));
    
    socket.on("signal", (data) => {
        const target = data.role === "phone" ? "controller" : "phone";
        socket.to(target).emit("signal", data.payload);
    });

    socket.on("command", (data) => {
        socket.to("phone").emit("command", data);
    });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
