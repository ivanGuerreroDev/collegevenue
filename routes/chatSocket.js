var connection  = require('../config/db');
var onlineUsers = {}
var resOnlineUsers = {}
module.exports = function(io) {
    io.on('connection', function(socket){
        onlineUsers[socket.handshake.query.id] = socket.id;
        resOnlineUsers[socket.id] = socket.handshake.query.id;
        console.log('conectado '+socket.handshake.query.id)
        socket.on('update messages', function (data) {
            connection.query(`
            SELECT 
            messages.id, messages.to_user, messages.from_user, messages.message, messages.timestamp, 
            users.firstName, users.surname, users.correo, profiles.avatar
            FROM messages
            JOIN users ON messages.from_user = users.id
            JOIN profiles ON messages.from_user = profiles.user_id
            WHERE 
            (messages.to_user = ${data.id} OR messages.from_user = ${data.id}) 
            AND (messages.to_user = ${data.id2} OR messages.from_user = ${data.id2}) 
            AND messages.timestamp <= ${data.timestamp}
            ORDER BY timestamp DESC 
            LIMIT ${data.from}, ${data.to}
            `,function(err,rows){
            if(err){
                console.log('error con el query');
                console.log(err);
            }else{
            if(rows){
                var socketID = onlineUsers[data.correo];
                socket.emit('MESSAGES_SEND', rows)
            }
            }
            });
        })
        socket.on('update chats', function (data) {
            console.log('chats solicitados')
            connection.query(`
            SELECT chats.id, chats.user_1, chats.user_2, chats.last_message, messages.message, messages.timestamp, users.firstName, users.surname, users.correo, profiles.avatar
            FROM chats
            JOIN messages ON chats.last_message = messages.id
            JOIN users on (chats.user_1 = users.id OR chats.user_2 = users.id) AND users.id != ${data.id}
            JOIN profiles ON (chats.user_1 = profiles.user_id OR chats.user_2 = profiles.user_id)
            WHERE chats.user_1 = ${data.id} OR chats.user_2 = ${data.id}
            GROUP BY chats.id
            `,function(err,rows){
            if(err){console.log(err);}
            else{ 
            if(rows){
                console.log('chats enviados')
                socket.emit('CHATS_SEND', rows)
            }
            }
            });
        })
        socket.on('connected', function(data){
        connection.query(`
            SELECT correo 
            FROM users 
            WHERE id IN ( SELECT follows.follow 
                        FROM follows 
                        WHERE follows.user_id IN (SELECT users.id 
                                                    FROM users 
                                                    WHERE correo = '${data.id}')
                    )
            `,function(err,rows){
                if(err){
                console.log('hubo error');
                socket.to(onlineUsers[data.id]).emit('connectedFriends', {sucess:false, friends:null});
                }else{
                if(rows){
                    
                    var connectedFriends = [];
                    var n = rows.length;
                    //console.log(findUser(connectedFriends));

                    for(var i = 0; i < n; i++){
                    if(onlineUsers[rows[i].correo]){
                        connectedFriends.push(rows[i].correo);
                    }else{
                        continue;
                    }
                    }
                    
                    
                    //console.log(findUser(data.id));
                    socket.to(onlineUsers[data.id]).emit('connectedFriends', {sucess:true, friends:connectedFriends});
                    console.log('enviando online');

                }else{
                    socket.to(onlineUsers[data.id]).emit('connectedFriends', {sucess:true, friends:null})
                }
                }
        });
        /*
        connection.query(`SELECT * FROM forSendMessages
        WHERE to_user = ${socket.handshake.query.user}`,function(err,rows){
        if(err){console.log(err)}else{
            socket.emit()
        }
        })
        */
        })
        socket.on('new message', function(data){
        connection.query(`
        INSERT INTO messages 
        (to_user, from_user, message, timestamp)
        VALUES
        ( ${data.to_user}, ${data.from_user}, '${data.message}', ${data.timestamp})
        `,function(err,rows){ 
            if(err){
                console.log(err);
            }else{
                connection.query(`
                SELECT *
                FROM chats 
                WHERE (user_1 = ${data.from_user} OR user_2 = ${data.from_user}) AND (user_1 = ${data.to_user} OR user_2 = ${data.to_user})
                `,function(err,rows2){
                if(err){console.log(err)}
                else{
                    if(rows2.length == 0){
                    connection.query(`
                    INSERT INTO chats
                    (user_1, user_2,last_message)
                    VALUES
                    (${data.from_user}, ${data.to_user}, ${rows.insertId})
                    `,function(err,rows3){console.log(err)})
                    }
                }
                })
                connection.query(`
                SELECT firstName, surname
                FROM users  
                WHERE id = ${data.from_user}
                `,function(err,rows4){
                    if(err){console.log(err)}
                    else{
                        console.log(onlineUsers[data.correo])  
                        if(onlineUsers[data.correo]){
                            io.to(onlineUsers[data.correo]).emit('MESSAGE_SEND',{
                                id:rows.insertId, 
                                message: data.message,  
                                from_user: data.from_user, 
                                timestamp: data.timestamp, 
                                firstName: rows4[0].firstName,
                                surname: rows4[0].surname
                            })      
                        }
                    }
                })
                
            }
        });
        })
        socket.on('disconnect', function(socket){
            //console.log(socket+ ':me desconecte');
            //console.log(onlineUsers[socket.id]);
            delete onlineUsers[resOnlineUsers[socket.id]];
            delete resOnlineUsers[socket.id];
            //console.log(onlineUsers[socket.id]);
        });
    });
}  