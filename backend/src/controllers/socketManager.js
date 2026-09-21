import { Server } from "socket.io"


let connections = {}
let messages = {}
let timeOnline = {}
let roomHosts = {}

export const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true
        }
    });


    io.on("connection", (socket) => {

        console.log("SOMETHING CONNECTED")

        socket.on("request-join-call", (path, username) => {
            if (connections[path] === undefined) {
                connections[path] = [];
            }
            
            // First person to join becomes the host
            if (!roomHosts[path] || connections[path].length === 0) {
                roomHosts[path] = socket.id;
                executeJoinCall(path, socket.id);
            } else {
                // Not host, ask host for admission
                io.to(roomHosts[path]).emit("guest-requesting-join", { socketId: socket.id, username: username });
            }
        });

        socket.on("admit-guest", (guestSocketId, path, admit) => {
            if (roomHosts[path] === socket.id) { // Only host can admit
                if (admit) {
                    io.to(guestSocketId).emit("join-accepted");
                    executeJoinCall(path, guestSocketId);
                } else {
                    io.to(guestSocketId).emit("join-denied");
                }
            }
        });

        // Original join logic extracted to a function
        const executeJoinCall = (path, sckId) => {
            if (!connections[path].includes(sckId)) {
                connections[path].push(sckId);
            }

            timeOnline[sckId] = new Date();

            for (let a = 0; a < connections[path].length; a++) {
                io.to(connections[path][a]).emit("user-joined", sckId, connections[path]);
            }

            if (messages[path] !== undefined) {
                for (let a = 0; a < messages[path].length; ++a) {
                    io.to(sckId).emit("chat-message", messages[path][a]['data'],
                        messages[path][a]['sender'], messages[path][a]['socket-id-sender']);
                }
            }
        };

        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        })

        socket.on("chat-message", (data, sender) => {

            const [matchingRoom, found] = Object.entries(connections)
                .reduce(([room, isFound], [roomKey, roomValue]) => {


                    if (!isFound && roomValue.includes(socket.id)) {
                        return [roomKey, true];
                    }

                    return [room, isFound];

                }, ['', false]);

            if (found === true) {
                if (messages[matchingRoom] === undefined) {
                    messages[matchingRoom] = []
                }

                messages[matchingRoom].push({ 'sender': sender, "data": data, "socket-id-sender": socket.id })
                console.log("message", matchingRoom, ":", sender, data)

                connections[matchingRoom].forEach((elem) => {
                    io.to(elem).emit("chat-message", data, sender, socket.id)
                })
            }

        })

        socket.on("disconnect", () => {

            var diffTime = Math.abs(timeOnline[socket.id] - new Date())

            var key

            for (const [k, v] of JSON.parse(JSON.stringify(Object.entries(connections)))) {

                for (let a = 0; a < v.length; ++a) {
                    if (v[a] === socket.id) {
                        key = k

                        for (let a = 0; a < connections[key].length; ++a) {
                            io.to(connections[key][a]).emit('user-left', socket.id)
                        }

                        var index = connections[key].indexOf(socket.id)

                        connections[key].splice(index, 1)


                        if (connections[key].length === 0) {
                            delete connections[key];
                            delete roomHosts[key];
                        } else if (roomHosts[key] === socket.id) {
                            // Assign new host to the next person in line
                            roomHosts[key] = connections[key][0];
                        }
                    }
                }

            }


        })


    })


    return io;
}
