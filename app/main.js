const net = require("net");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  //  ensure that your server is listening for connections on the correct port.
  socket.on("data", (data) => {
    const message = data.toString();
    /*
      GET /index.html HTTP/1.1
      Host: localhost:4221
      User-Agent: curl/8.4.0
      Accept:* 
    */
    const [method, path] = message.split(" ");

    if (method === "GET" && path === "/") {
      socket.write(`HTTP/1.1 200 OK\r\n\r\n`);
    } else {
      socket.write(`HTTP/1.1 404 Not Found\r\n\r\n`);
    }
  });

  socket.on("close", () => {
    socket.end();
    server.close();
  });
});

server.listen(4221, "localhost");
