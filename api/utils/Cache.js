const Memori = require('memori');
const cache = new Memori(sails.config.http.cache);

module.exports = {
  set: (key, value, ttl, done) => {
    cache.set(key, value, ttl, (err, result) => {
      if(err) {return done('Internal Server Error');}
      return done(null, result);
    });
  },

  expire: (key, ttl, done) => {
    cache.expire(key, ttl, (err, result) => {
      if(err) {return done('Internal Server Error');}
      return done(null, result);
    });
  },

  get: (key, done) => {
    cache.get(key, (err, result) => {
      if(err) {return done('Internal Server Error');}
      return done(null, result);
    });
  },

  delete: (key, done) => {
    cache.del(key, (err, result) => {
      if(err) {return done('Internal Server Error');}
      return done(null, result);
    });
  },

  range: (key, done) => {
    cache.range(key, (err, result) => {
      if(err) {return done('Internal Server Error');}
      return done(null, result);
    });
  },

  push: (key, value, done) => {
    cache.push(key, value, (err, result) => {
      if(err) {return done('Internal Server Error');}
      return done(null, result);
    });
  },

  rem: (key, value, done) => {
    cache.rem(key, value, (err, result) => {
      if(err) {return done('Internal Server Error');}
      return done(null, result);
    });
  },

  incr: (key, value, done) => {
    cache.incr(key, value, (err, result) => {
      if(err) {return done('Internal Server Error');}
      return done(null, result);
    });
  },

  decr: (key, value, done) => {
    cache.decr(key, value, (err, result) => {
      if(err) {return done('Internal Server Error');}
      return done(null, result);
    });
  }
};
