/**
 * Created by seven on 15/5/31.
 */

var ProtoBuf = require("protobufjs"),
    JSON = require("json3");

var builder = ProtoBuf.loadProtoFile("./www/hour.proto"),
    AN = builder.build("analysis");


var tempBuf = ProtoBuf.ByteBuffer.allocate(20 * 1024 * 1024)

// read the hour.json data
var fs = require("fs") // require is a special function provided by node
fs.readFile("./hour.json", function doneReading(err, fileContents) {
    if (err) throw err;
    //console.log(fileContents.toString());
    var ddd = JSON.parse(fileContents.toString());

    // for time array
    var timestamps = new AN.TimeArr();
    for (var i = 0; i < ddd.time.length; ++i)
        timestamps['timestamp'][i] = ddd.time[i];


    // for data array
    var datas = new AN.DataArr();
    for (var j = 0; j < ddd.data.length; ++j) {
        var dataobj = new AN.DataObj();
        for (var key in ddd.data[j]) {
            var regionD = ddd.data[j][key];
            // every ragion's data
            var bps = new AN.BpsObj({
                    "delay": regionD["bps"]["delay"],
                    "delay_source": regionD["bps"]["delay_source"],
                    "delay_dynamic": regionD["bps"]["delay_dynamic"],
                }),
                b = new AN.BObj({
                    "total": regionD["B"]["total"],
                    "ht": regionD["B"]["ht"],
                    "ms": regionD["B"]["ms"],
                }),
                req = new AN.ReqObj({
                    "total": regionD["req"]["total"],
                    "ps": regionD["req"]["ps"],
                    "ht": regionD["req"]["ht"],
                    "ms": regionD["req"]["ms"],
                    "cs": regionD["req"]["cs"],

                    "dyn502": regionD["req"]["502_dyn"],
                    "dyn503": regionD["req"]["503_dyn"],
                    "dyn504": regionD["req"]["504_dyn"],
                    "bak502": regionD["req"]["502_bak"],
                    "bak503": regionD["req"]["503_bak"],
                    "bak504": regionD["req"]["504_bak"],

                    "dyn5xx": regionD["req"]["5xx_dyn"],
                    "bak5xx": regionD["req"]["5xx_bak"],
                }),
                f = new AN.FObj({
                    "total": regionD["F"]["total"]
                }),
                region = new AN.RegionObj(bps, b, req, f);

            dataobj["region"].push(key);
            dataobj["regionobj"].push(region);
        }
        datas["datapg"][j] = dataobj;
    }

    // pack
    var file = "./www/hour.bin";
    var buf = new AN.Hour({"timestamps": timestamps, "datas": datas});
    buf = buf.encode(tempBuf).flip().toBuffer();
    fs.writeFile(file, buf, function (err) {
        if (err) throw err;
        console.log('It\'s saved!');
    });
    console.log(ProtoBuf.ByteBuffer.wrap(buf));
    // unpack

    fs.readFile( file, function(err, data){
        var jjj = AN.Hour.decode(data);
        console.log(jjj);
    });


})