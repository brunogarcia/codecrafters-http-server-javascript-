const net = require("net");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  //  ensure that your server is listening for connections on the correct port.
  socket.on("data", (data) => {
    // Step 1: Extract the path
    const message = data.toString();
    const [method, path] = message.split(" ");
    const [_, echo, ...tail] = path.split("/");

    if (method === "GET" && path === "/") {
      socket.write(`HTTP/1.1 200 OK\r\n\r\n`);
    } else if (method === "GET" && echo === "echo" && tail.length > 0) {
      // Step 2: Create your response
      const randomString = tail.join("/");
      const statusLine = "HTTP/1.1 200 OK\r\n";
      const headers = `Content-Type: text/plain\r\nContent-Length: ${randomString.length}\r\n\r\n`;
      const responseBody = randomString;
      const response = statusLine + headers + responseBody;

      // Step 3: Send the response
      socket.write(response);
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
