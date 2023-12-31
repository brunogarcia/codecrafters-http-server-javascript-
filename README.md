[![progress-banner](https://backend.codecrafters.io/progress/http-server/6e3ed974-7fe6-4e27-a819-55ce6915919e)](https://app.codecrafters.io/users/codecrafters-bot?r=2qF)

This is a starting point for JavaScript solutions to the
["Build Your Own HTTP server" Challenge](https://app.codecrafters.io/courses/http-server/overview).

[HTTP](https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol) is the
protocol that powers the web. In this challenge, you'll build a HTTP/1.1 server
that is capable of serving multiple clients.

Along the way you'll learn about TCP servers,
[HTTP request syntax](https://www.w3.org/Protocols/rfc2616/rfc2616-sec5.html),
and more.

**Note**: If you're viewing this repo on GitHub, head over to
[codecrafters.io](https://codecrafters.io) to try the challenge.

## Testing your code

First, [install bun](https://bun.sh/#install).

Then, run `./your_server.sh` to start your server and finally run these curl commands to test your server:

### Echo server

```sh
curl -i -X GET http://localhost:4221/echo/abc
```

### Request with a User-Agent header

```sh
curl --verbose http://localhost:4221/echo/abc/user-agent
```

### Send a file

```sh
curl -vvv -d "hello world" localhost:4221/files/readme.txt
```

### Request a file

```sh
curl -i -X GET http://localhost:4221/files/readme.txt
```
