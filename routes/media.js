var express = require('express');
var spawn = require('child_process').spawn;
var router = express.Router();
var debug = require('debug')('you-get:server:media');
var url = require('url');
var https = require('https');
var http = require('http');

router.get('/info/:url', function (req, res, next) {
  const param = ['--json', req.params['url']];
  const posProc = spawn('you-get', param);
  posProc.stdout.pipe(res);
  posProc.on('error', function (error) {
    debug('解析异常:', error);
    res.send({error});
  });
  posProc.on('exit', function (code) {
    debug('解析退出:', req.params['url']);
  });
});

router.get('/download/:url/:name', function (req, res, next) {
  const toURL = url.parse(req.params['url']);
  var sreq = (toURL.protocol == "https:" ? https : http).request({
    host: toURL.host, // 目标主机
    path: toURL.path, // 目标路径
    method: req.method // 请求方式
  }, function (sres) {
    sres.pipe(res);
    sres.on('end', function () {
      debug('转发退出:', req.params['url']);
    });
  });
  sreq.on('error', (err) => {
    debug('转发退出:', err);
    res.end();
  });
  sreq.end();
});

module.exports = router;
