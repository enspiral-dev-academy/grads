var pl = require('pull-level')

/*
create

returns a new high entropy url, associated with a resource (email address)

when someone accesses that resource.
that resource is associated with a cookie in their browser.
(record user agent, so that it's possible to show the user a list of logins they currently have)

---

note, to make curl work with cookies must set a "cookie jar"
it seems: `-c file` sets the file to write to,
and `-b file` sets the file to write to. You'd think you'd want
those both to be the same file!
The man page is not clear about this at all.

`curl localhost:8000 -c ./jar -b ./jar`

the man page says that -c should work, but it only seems to write the
jar but not read it! once the cookie is written, you can use -b or --cookie

but that doesn't make sense because there isn't even a b in cookie.
anyway, "cookie" is one of the worst named things in the web stack.
it's a damn ticket stub!
nobody ever gave you a cookie with a seat number on it.

---

What you need to know about cookies.

A cookie is always `key=value` and has "attributes"
that tell the browser what to do. you need `Expires={date}` and `Path=/`.

Without `Expires` set in the future, the cookie will be a "session cookie"
and will expire after the browser exits.

Without `Path=/` the browser will only send the cookie on the path
that it got it from.

*/

var Stack = require('stack')
var Tiny = require('tiny-route')
var crypto = require('crypto')

function random () {
  return crypto.randomBytes(20).toString('hex')
}

function createCookie(value) {
  return (
    'cookie='+value
  + ';Path=/'
  + ';Expires='+new Date(Date.now() + 60e3*60*24*365)

  //Security

  //prevents this cookie being sent from another page.
  // https://tools.ietf.org/html/draft-west-first-party-cookies-03
  + 'FirstPartyOnly;'

  // Don't expose cookie to js, prevents XSS attacks from stealing the cookie.
  + 'HttpOnly;' //don't expose to js

  //do not send over http. https only.
  // + 'Secure;' //this should really be used, but need https.
  )
}


module.exports = function (db) {

  var tickets = {}, byId = {}, stubs = {}

  //administrator role creates a new access token
  //TICKET
  //this can have a time limit (say, 3 days) or number of uses.

  function create (id, cb) {
    var ticket = random()
    db.batch([
      {key: ['ticket', ticket], value: id, type: 'put'},
      {key: ['resource', id], value: ticket, type: 'put'},
    ], function (err) {
      if(err) return cb(err)
      return cb(null, ticket)
    })
  }

  //user visits url, access token is used and cookie is created.
  //TICKET STUB.
  //now stub (cookie) represents
  function redeem (ticket, cb) {

    console.log('GET', ['ticket', ticket])
    db.get(['ticket', ticket], function (err, id) {
      if(err) return cb(new Error('unknown or expired ticket'))
      var stub = random()
      db.batch([
        {key: ['ticket', ticket], type: 'del'},
        {key: ['id', id], type: 'del'},
        {key: ['stub', stub], value: id, type: 'put'}
      ], function (err) {
        if(err) cb(err)
        else cb(null, createCookie(stub))
      })
    })
  }

  //since this is all in memory currently,
  //create a resource for testing.

  return  {
    create: create,
    redeem: redeem,
    check: function (cookie, cb) {
      //check whether this cookie is valid.
      if(!cookie) return cb(new Error('no cookie'))
      db.get(['stub', cookie.replace(/^cookie=/, '')], function (err, id) {
        if(!id) return cb(new Error('unknown cookie'))
        cb(null, id)
      })
    },
    dump: function () {
      return pl.read(db)
    }
  }

//  auth.create('foobar', console.log)

//  return Stack(
//    // GET /redeem/<code>
//    // this route is hit once, by clicking on a link in an email.
//    // this tears the ticket, and the cookie represents the validated
//    // ticket stub (or: clipped ticket which shows they paid to be on the bus)
//    Tiny.get(/\/redeem\/([0-9a-f]+)/, function (req, res, next) {
//      auth.redeem(req.params[0], function (err, cookie) {
//        if(err) return next(err)
//        res.setHeader('Set-Cookie', cookie)
//        res.setHeader('Location', '/')
//        res.statusCode = 303
//        res.end('accepted')
//      })
//    }),
//    function (req, res, next) {
//      auth.check(req.headers.cookie, function (err, resource) {
//        console.log(err, resource)
//        if(err) return next(403) //unauthorized
//        res.end("OKAY:" + req.headers.cookie + ' ' + resource)
//      })
//    }
//  )
}

//if(!module.parent) {
//  require('http').createServer(module.exports()).listen(8000)
//}

















