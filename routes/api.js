var express = require('express');
var router = express.Router();
var UUID = require('uuid');

var config = require('../config/index');

var event = require('../bin/event');

var { Del, Gets, HGETALL, SADD, SREM, SMEMBERS, HMSET, SISMEMBER } = require('../public/javascripts/redis')

var APIRouter = function (io) {
    var chat = io.of('/chat');

    router.get('/room/people/count', function (req, res, next) {
        const room = req.query.room;
        chat.in(room).clients((err, clients) => {
            res.send({ roomId: room, count: clients.length });
        })
    })
    router.get('/room/people/detail', function (req, res, next) {
        const room = req.query.room;
        chat.in(room).clients((err, clients) => {
            const keys = clients;
            const users = [];
            if (keys.length == 0) {
                res.send(users);
            }
            else {
                keys.forEach((element, index) => {
                    HGETALL(element).then((respond) => {
                        respond.SocketId = element;
                        SISMEMBER('forbid-' + room, respond.Id).then((num) => {
                            respond.Forbid = num > 0 ? true : false
                            users.push(respond);
                            if (index == keys.length - 1) {
                                res.send(users);
                            }
                        })
                    })
                });
            }
        })
    })
    router.get('/room/notice', function (req, res, next) {
        const room = 'notice-' + req.query.room;
        SMEMBERS(room).then((keys) => {
            let notices = [];
            if (keys.length == 0) {
                res.send(notices);
            } else {
                keys.forEach((element, index) => {
                    HGETALL(element).then((respond) => {
                        respond.Id = element;
                        notices.push(respond);
                        if (index == keys.length - 1) {
                            notices.sort(function (a, b) {
                                if (a.time > b.time) {
                                    return -1
                                }
                                if (a.time < b.time) {
                                    return 1
                                }
                                return 0
                            })
                            res.send(notices);
                        }
                    })
                })
            }
        })
    })

    router.post('/room/newnotice', function (req, res, next) {
        const room = req.body.room;
        // const title = req.body.title;
        const creator = req.body.creator;
        const creatorId = req.body.creatorId;
        const context = req.body.context;
        const key = UUID.v1();
        const notice = {
            id: key, creator, context, time: Date.now(), creatorId
        }
        SADD('notice-' + room, key).then((respond) => {
            HMSET(key, notice);
        })
        chat.in(room).emit(event.USER_ROOMNEWNOTICE, notice);
        res.send({ status: 1, msg: 'success', notice })
    })

    router.post('/room/removenotice', function (req, res, next) {
        const room = req.body.room;
        const key = req.body.id;
        SREM('notice-' + room, key);
        Del(key);
        chat.in(room).emit(event.USER_ROOMREMOVENOTICE, { id: key });
        res.send({ status: 1, msg: 'success' })
    })

    //设置禁言
    router.post('/room/forbid', function (req, res, next) {
        const room = req.body.room;
        const stuid = req.body.id;
        chat.to(room).emit(event.SET_USER_FORBID, { id: stuid })
        SADD('forbid-' + room, stuid).then(() => {
            res.send({ status: 1, msg: "success" })
        })
    })
    //解除禁言
    router.post('/room/removeforbid', function (req, res, next) {
        const room = req.body.room;
        const stuid = req.body.id;
        const result = SREM('forbid-' + room, stuid);
        chat.to(room).emit(event.SET_USER_UNFORBID, { id: stuid })
        res.send({ status: 1, msg: "success" })

    })
    //获取禁言状态
    router.get('/peopel/forbid', function (req, res, next) {
        const room = req.query.room;
        const stuid = req.query.id;
        SISMEMBER('forbid-' + room, stuid).then((num) => {
            res.send({ status: num > 0 ? 1 : 0 })
        })
    })
    return router;
};



module.exports = APIRouter;