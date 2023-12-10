const net = require("net");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  //  ensure that your server is listening for connections on the correct port.
  socket.on("data", (data) => {
    socket.write(`HTTP/1.1 200 OK\r\n\r\n`);

    // const message = data.toString();
    // if (message === "Hello") {
    //   socket.write("Goodbye!");
    // }
  });

  socket.on("close", () => {
    socket.end();
    server.close();
  });
});

server.listen(4221, "localhost");
