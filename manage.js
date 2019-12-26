const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');


function add(bot) {
  return new Promise((resolve, reject) => {
    fetch(bot.id).then(ans => {
      if (ans !== false) return resolve(false)
      MongoClient.connect(process.env.MONGO_DB_URL, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, client) {
        assert.equal(null, err);
        const db = client.db('botlist');
        const collection = db.collection('bots');
        collection.insertMany([{ bot: bot }], function(err, result) {
          assert.equal(err, null);
          assert.equal(1, result.result.n);
          assert.equal(1, result.ops.length);
          client.close();
          resolve(true)
        })
      });
    })
  })
}

function mine(id) {
  return new Promise((resolve, reject) => {
      MongoClient.connect(process.env.MONGO_DB_URL, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, client) {
        assert.equal(null, err);
        const db = client.db('botlist');
        const collection = db.collection('bots');
        collection.find({}).toArray(function(err, docs) {
          assert.equal(err, null);
          var returner = [];
          docs.forEach(function(shell) {
            let bot = shell.bot;
            if (!bot.owner) return;
            if (bot.owner !== id) return;
            returner.push(bot);
          })
          resolve(returner);
        });
      })
    })
}


function verify(id) {
  return new Promise((resolve, reject) => {
      MongoClient.connect(process.env.MONGO_DB_URL, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, client) {
        assert.equal(null, err);
        const db = client.db('botlist');
        const collection = db.collection('bots');
        
        fetch(id).then(res => {
          let r = res.bot;
          collection.updateOne({bot: r} , { $set: { "bot.state" : "verified" } }, function(err, result) {
            assert.equal(err, null);
            assert.equal(1, result.result.n);
            resolve(r)
          });  
        })
      })
  })
}

function update(id, bot) {
  return new Promise((resolve, reject) => {
      MongoClient.connect(process.env.MONGO_DB_URL, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, client) {
        assert.equal(null, err);
        const db = client.db('botlist');
        const collection = db.collection('bots');
          collection.updateOne({"bot.id": id} , { $set: { "bot" : bot } }, function(err, result) {
            assert.equal(err, null);
            assert.equal(1, result.result.n);
            resolve(true)
          })
      })
  })
}


function unverify(id) {
  return new Promise((resolve, reject) => {
      MongoClient.connect(process.env.MONGO_DB_URL, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, client) {
        assert.equal(null, err);
        const db = client.db('botlist');
        const collection = db.collection('bots');
        fetch(id).then(res => {
          let r = res[0];
          let changed = r.state = "unverified";
          collection.updateOne({bot: r} , { $set: { bot : changed } }, function(err, result) {
            assert.equal(err, null);
            assert.equal(1, result.result.n);
            resolve(changed)
          });  
        })
      })
  })
}

function fetch(id) {
    return new Promise((resolve, reject) => {
      MongoClient.connect(process.env.MONGO_DB_URL, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, client) {
        assert.equal(null, err);
        const db = client.db('botlist');
        const collection = db.collection('bots');
        collection.find({}).toArray(function(err, docs) {
          assert.equal(err, null);
          let found = false;
          docs.forEach(function(thing) {
            if (thing.bot.id === id) {
              found = true
              resolve(thing)
            }
          })
          if (!found) resolve(false)
        });
      })
    })
}

function search(query) {
  query = query.toLowerCase()
    return new Promise((resolve, reject) => {
      MongoClient.connect(process.env.MONGO_DB_URL, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, client) {
        assert.equal(null, err);
        const db = client.db('botlist');
        const collection = db.collection('bots');
        collection.find({}).toArray(function(err, docs) {
          assert.equal(err, null);
          let found = [];
          docs.forEach(function(thing) {
            if (thing.bot.name.toLowerCase().includes(query)) found.push(thing.bot);
            else if (thing.bot.description.toLowerCase().includes(query)) found.push(thing.bot);
            else if (thing.bot.id === query) found.push(thing.bot);
          })
          resolve(found)
        });
      })
    })
}


function remove(id) {
    return new Promise((resolve, reject) => {
      MongoClient.connect(process.env.MONGO_DB_URL, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, client) {
        assert.equal(null, err);
        const db = client.db('botlist');
        const collection = db.collection('bots');
        fetch(id).then(res => {
          collection.deleteOne({ "bot.id" : id }, function(err, result) {
            if (result.result.n === 0) return resolve(false)
            else resolve(res.bot)
          });
        })
      })
    })
}

function fetchAll() {
    return new Promise((resolve, reject) => {
      MongoClient.connect(process.env.MONGO_DB_URL, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, client) {
        assert.equal(null, err);
        const db = client.db('botlist');
        const collection = db.collection('bots');
        collection.find({}).toArray(function(err, docs) {
          assert.equal(err, null);
          resolve(docs)
        });
      })
    })
}

function queue() {
    return new Promise((resolve, reject) => {
      MongoClient.connect(process.env.MONGO_DB_URL, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, client) {
        assert.equal(null, err);
        const db = client.db('botlist');
        const collection = db.collection('bots');
        collection.find({}).toArray(function(err, docs) {
          assert.equal(err, null);
          let list = []
          docs.forEach(frame => {
            let s = frame.bot.state
            if (s == "unverified") list.push(frame.bot)
          })
          return resolve(list)
        });
      })
    })
}

function drop() {
  MongoClient.connect(process.env.MONGO_DB_URL, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, client) {
    assert.equal(null, err);
    const db = client.db('botlist');
    const collection = db.collection('bots');
    collection.drop()
  })
}

module.exports = {
  add:      function(bot)  {   return add(bot)     },
  fetch:    function(id)   {   return fetch(id)    },
  mine:     function(id)   {   return mine(id)     },
  verify:   function(id)   {   return verify(id)   },
  unverify: function(id)   {   return unverify(id) },
  remove:   function(id)   {   return remove(id)   },
  fetchAll: function()     {   return fetchAll()   },
  drop:     function()     {   return drop()       },
  queue:    function()     {   return queue()      },
  update:   function(a, b) {   return update(a, b) },
  search:   function(q)    {   return search(q)    }
}
