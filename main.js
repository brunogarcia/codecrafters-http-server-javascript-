const fs = require("fs");
const net = require("net");
const fsPromise = require("fs").promises;
const { once } = require("events");

// get the directory from the command line arguments
const directoryFlagIndex = process.argv.indexOf("--directory");
const directory = process.argv[directoryFlagIndex + 1];

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

const handleGetRequest = async (socket, request) => {
  const { message, pathComplete, pathMain, pathTail } = request;
  const isRootPath = pathComplete === "/";
  const isEchoPath = pathMain === "echo";
  const isFilesPath = pathMain === "files";
  const isUserAgentPath = pathMain === "user-agent";

  // user-agent path
  const requestLines = message.split("\r\n");
  let userAgentValue = "";
  for (let line of requestLines) {
    if (line.startsWith("User-Agent:")) {
      userAgentValue = line.split(": ")[1];
    }
  }

  if (isRootPath) {
    socket.write(`HTTP/1.1 200 OK\r\n\r\n`);
  } else if (isEchoPath && pathTail.length > 0) {
    const randomString = pathTail.join("/");
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
  } else if (isFilesPath) {
    // get the path of the file
    const filePath = `${directory}/${pathTail}`;
    const isFileExists = fs.existsSync(filePath);

    // check if the file exists in the directory
    if (isFileExists) {
      // read its contents and send them back to the client
      const size = await fsPromise.stat(filePath).then((stat) => stat.size);
      const statusLine = "HTTP/1.1 200 OK\r\n";
      const headers = `Content-Type: application/octet-stream\r\nContent-Length: ${size}\r\n\r\n`;
      const fileContents = await fsPromise.readFile(filePath);
      socket.write(statusLine + headers + fileContents);
    } else {
      // if the file doesn't exist, send back a 404 error
      socket.write(`HTTP/1.1 404 Not Found\r\n\r\n`);
      socket.end();
    }
  } else {
    // if the path is not valid, send back a 404 error
    socket.write(`HTTP/1.1 404 Not Found\r\n\r\n`);
    socket.end();
  }
};

const handlePostRequest = async (socket, request) => {
  const { message, pathMain, pathTail } = request;
  const isFilesPath = pathMain === "files";

  if (isFilesPath) {
    const filePath = `${directory}/${pathTail}`;
    const fileContents = message.split("\r\n\r\n")[1];

    // write the contents to the file and send back a 201 response
    await fsPromise.writeFile(filePath, fileContents);
    socket.write("HTTP/1.1 201 OK\r\n\r\n");
    socket.end();
  } else {
    // if the path is not valid, send back a 404 error
    socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
    socket.end();
  }
};

const server = net.createServer((socket) => {
  socket.on("data", async (data) => {
    const message = data.toString();

    const [method, pathComplete] = message.split(" ");
    const [_pathInit, pathMain, ...pathTail] = pathComplete.split("/");

    const request = { message, pathComplete, pathMain, pathTail };

    if (method === "GET") {
      handleGetRequest(socket, request);
    }

    if (method === "POST") {
      handlePostRequest(socket, request);
    }
  });

  socket.on("close", () => {
    socket.end();
    server.close();
  });
});

server.listen(4221, "localhost");
