const express = require('express');
const path = require('path');
const Influx = require('influx');

var app = module.exports = express();

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

var influxdbhost = process.env.INFLUXDB_PORT_8086_TCP_ADDR || 'influxdb-hono.192.168.64.2.nip.io/',
    influxdbport = process.env.INFLUXDB_PORT_8086_TCP_PORT || 80;

app.use(express.static(path.join(__dirname, 'public')));

app.use('/gauge', express.static(__dirname + '/node_modules/gaugeJS/dist/'));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist/'));

app.engine('html', require('ejs').renderFile);

const influx = new Influx.InfluxDB({
  host: influxdbhost, port: influxdbport,
  database: 'kubecon',
})

influx.getDatabaseNames()
  .then(names => { console.log(names) });

app.get('/', function(req, res){
  res.render('index.html');
});

app.get('/power_consumption', function(req,res) {
  influx.query(`
    select * from P
    order by time desc
    limit 1
  `).then(rows => {
    rows.forEach(row =>     res.json(row))
  })
})


/* istanbul ignore next */
if (!module.parent) {
  app.listen(port, ip);
  console.log('Express listening on ' + ip + ':' + port);
}
