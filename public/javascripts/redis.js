const config = require('../../config/index');
var redis = require("redis"),
    client = redis.createClient({
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password
    });
//设置 key-value
function Set(key, value) {
    client.set(key, value, redis.print);
}

//获取 Value
function Gets(callback, keys) {
    client.mget(keys, callback);
}

//根据KEY 删除
function Del(key) {
    client.del(key, redis.print);
}

//添加哈希
function HMSET(key, value) {
    client.hmset(key, value, redis.print)
}

//获取指定哈希的所有Value
function HGETALL(key) {
    return new Promise((resolve, reject) => {
        client.hgetall(key, (err, reply) => {
            if (err) {
                reject(err)
            } else {
                resolve(reply)
            }
        })
    })
}

// 设置集合
function SADD(key, value) {
    return new Promise((resolve, reject) => {
        client.sadd(key, value, (err, reply) => {
            if (err) {
                reject(err)
            } else {
                resolve(reply)
            }
        })
    })
}
//集合中移除指定的value
function SREM(key, value) {
    return client.srem(key, value)
}

//获取集合中的值
function SMEMBERS(key) {
    return new Promise((resolve, reject) => {
        client.smembers(key, (err, reply) => {
            if (err) {
                reject(err)
            } else {
                resolve(reply)
            }
        })
    })
}
//判断某个元素是否存在集合中
function SISMEMBER(key, value) {
    return new Promise((resolve, reject) => {
        client.sismember(key, value, (err, reply) => {
            if (err) {
                reject(err)
            } else {
                resolve(reply)
            }
        })
    })
}

module.exports.Set = Set;
module.exports.Gets = Gets;
module.exports.Del = Del;
module.exports.HMSET = HMSET;
module.exports.HGETALL = HGETALL;
module.exports.SADD = SADD;
module.exports.SREM = SREM;
module.exports.SMEMBERS = SMEMBERS;
module.exports.SISMEMBER = SISMEMBER;