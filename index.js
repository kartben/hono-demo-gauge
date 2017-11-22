const express = require('express');
const path = require('path');
const Influx = require('influx');

var app = module.exports = express();

app.use(express.static(path.join(__dirname, 'public')));

app.use('/gauge', express.static(__dirname + '/node_modules/gaugeJS/dist/'));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist/'));

app.engine('html', require('ejs').renderFile);

const influx = new Influx.InfluxDB({
  host: 'influxdb-hono.192.168.64.2.nip.io/', port: 80,
  database: 'kubecon',
})

influx.getDatabaseNames()
  .then(names => { console.log(names) })




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
  app.listen(3000);
  console.log('Express started on port 3000');
}