const net = require("net");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  //  ensure that your server is listening for connections on the correct port.
  socket.on("data", (data) => {
    // Step 1: Extract the path
    const message = data.toString();

    const [method, pathComplete] = message.split(" ");
    const [_, pathFirst, ...pathFirstTail] = pathComplete.split("/");

    const requestLines = message.split("\r\n");
    let userAgentValue = "";
    for (let line of requestLines) {
      if (line.startsWith("User-Agent:")) {
        userAgentValue = line.split(": ")[1];
      }
    }

    const isGetMethod = method === "GET";
    const isRootPath = isGetMethod && pathComplete === "/";
    const isEchoPath = isGetMethod && pathFirst === "echo";
    const isUserAgentPath = isGetMethod && pathFirst === "user-agent";

    if (isRootPath) {
      socket.write(`HTTP/1.1 200 OK\r\n\r\n`);
    } else if (isEchoPath && pathFirstTail.length > 0) {
      const randomString = pathFirstTail.join("/");
      const statusLine = "HTTP/1.1 200 OK\r\n";
      const headers = `Content-Type: text/plain\r\nContent-Length: ${randomString.length}\r\n\r\n`;
      const responseBody = randomString;
      const response = statusLine + headers + responseBody;
      socket.write(response);
    } else if (isUserAgentPath && userAgentValue.length > 0) {
      const statusLine = "HTTP/1.1 200 OK\r\n";
      const headers = `Content-Type: text/plain\r\nContent-Length: ${userAgentValue.length}\r\n\r\n`;
      const responseBody = userAgentValue;
      const response = statusLine + headers + responseBody;
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
