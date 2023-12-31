/**
 * This file contains the main server logic for handling HTTP requests.
 * It creates a TCP server that listens on port 4221 and handles GET and POST requests.
 * The server can serve static files, echo back request paths, and return the User-Agent header value.
 * The server requires a directory path to serve files from, which can be passed as a command line argument.
 *
 * @module main
 */
import fs from "fs";
import net from "net";
import fsPromise from "fs/promises";

type Payload = {
  socket: net.Socket;
  message: string;
  routes: Routes;
};

type Routes = {
  routeComplete: string;
  routeMain: string;
  routeEnd: string[];
};

type Headers = { contentType: string; length: number };

const status = {
  ok: "HTTP/1.1 200 OK\r\n",
  notFound: "HTTP/1.1 404 Not Found\r\n\r\n",
};

/**
 * Returns the directory path for a given file path.
 * @param path - The file path.
 * @returns The directory path.
 */
const getDirectory = (path: string) => {
  const directoryFlagIndex = process.argv.indexOf("--directory");
  const directory = process.argv[directoryFlagIndex + 1];
  return `${directory}/${path}`;
};

/**
 * Returns the HTTP headers string based on the provided payload headers.
 * @param payload - The headers object containing the contentType and length properties.
 * @returns The formatted HTTP headers string.
 */
const getHeaders = (payload: Headers) => {
  const { contentType, length } = payload;
  return `Content-Type: ${contentType}\r\nContent-Length: ${length}\r\n\r\n`;
};

/**
 * Handles a GET request.
 *
 * @param payload - The payload containing the socket, message, and routes.
 */
const handleGetRequest = async (payload: Payload) => {
  const { socket, message, routes } = payload;
  const { routeComplete, routeMain, routeEnd } = routes;

  const isRoot = routeComplete === "/";
  const isEcho = routeMain === "echo";
  const isFiles = routeMain === "files";
  const isUserAgent = routeMain === "user-agent";

  if (isRoot) {
    socket.write(status.ok);
  } else if (isEcho && routeEnd.length > 0) {
    const body = routeEnd.join("/");
    const headers = getHeaders({
      contentType: "text/plain",
      length: body.length,
    });
    socket.write(`${status.ok}${headers}${body}`);
  } else if (isUserAgent) {
    const lines = message.split("\r\n");

    let userAgentValue = "";
    for (let line of lines) {
      if (line.startsWith("User-Agent:")) {
        userAgentValue = line.split(": ")[1];
      }
    }

    const headers = getHeaders({
      contentType: "text/plain",
      length: userAgentValue.length,
    });

    socket.write(`${status.ok}${headers}${userAgentValue}`);
  } else if (isFiles) {
    // get the path of the file
    const filePath = getDirectory(routeEnd[0]);
    const isFileExists = fs.existsSync(filePath);

    // check if the file exists in the directory
    if (isFileExists) {
      const size = await fsPromise.stat(filePath).then((stat) => stat.size);
      const headers = getHeaders({
        contentType: "application/octet-stream",
        length: size,
      });
      const body = await fsPromise.readFile(filePath);

      socket.write(`${status.ok}${headers}${body}`);
    } else {
      // if the file doesn't exist, send back a 404 error
      socket.write(status.notFound);
      socket.end();
    }
  } else {
    // if the path is not valid, send back a 404 error
    socket.write(status.notFound);
    socket.end();
  }
};

/**
 * Handles a POST request.
 *
 * @param payload - The payload containing the socket, message, and routes.
 */
const handlePostRequest = async (payload: Payload) => {
  const { socket, message, routes } = payload;
  const { routeMain, routeEnd } = routes;
  const isFiles = routeMain === "files";

  if (isFiles) {
    const filePath = getDirectory(routeEnd[0]);
    const fileContents = message.split("\r\n\r\n")[1];

    // write the contents to the file and send back a 201 response
    await fsPromise.writeFile(filePath, fileContents);
    socket.write(status.ok);
    socket.end();
  } else {
    // if the path is not valid, send back a 404 error
    socket.write(status.notFound);
    socket.end();
  }
};

/**
 * Creates a TCP server that handles HTTP requests.
 * Using the net module, it listens on port 4221 and handles GET and POST requests.
 *
 * @param {net.Socket} socket - The socket object representing the client connection.
 */
const server = net.createServer((socket: net.Socket) => {
  socket.on("data", async (data: Buffer) => {
    const message = data.toString();

    const [method, routeComplete] = message.split(" ");
    const [_, routeMain, ...routeEnd] = routeComplete.split("/");

    const routes = { routeComplete, routeMain, routeEnd };

    if (method === "GET") {
      handleGetRequest({ socket, message, routes });
    }

    if (method === "POST") {
      handlePostRequest({ socket, message, routes });
    }
  });

  socket.on("close", () => {
    socket.end();
    server.close();
  });
});

server.listen(4221, "localhost");
