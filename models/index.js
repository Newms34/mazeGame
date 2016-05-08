var mongoose = require('mongoose');
var https = require('https');
if (process.env.NODE_ENV && process.env.NODE_ENV == 'development') {
    mongoose.connect('mongodb://localhost:27017/gw2pricealert');
} else {
    mongoose.connect('mongodb://newms34:mrdpn3450@ds021711.mlab.com:21711/heroku_hf915bgq');
}
var db = mongoose.connection;
var itIds = [24304, 24305, 24309, 24310, 24314, 24315, 24319, 24320, 24324, 24325, 24329, 24330, 24334, 24335, 24339, 24340, 68942, 70842, 24358, 24341, 24351, 24350, 24356, 24357, 24288, 24289, 24299, 24300, 24282, 24283, 24294, 24295, 46738, 46736, 46741, 46739]; //array of all item ids. This is hard-coded, tho i may eventually allow users to select (vote for?) other items to be added.
//current items: cores/lodestones, t5/t6 fine, ascended mats
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(e) {
    console.log('Database connected!')
        //checking to see if all items have data
    getData(itIds);
})

require('./Usr.js');
require('./Item.js');



var getData = function(ids) {
    var theUrl = 'https://api.guildwars2.com/v2/commerce/prices?ids=' + ids.join(',');
    https.get(
        theUrl,
        function(response) {
            // Continuously update stream with data
            var body = '';
            response.on('data', function(d) {
                body += d;
            });
            response.on('end', function() {
                //got prices
                parsedPrice = JSON.parse(body);
                var itUrl = 'https://api.guildwars2.com/v2/items?ids=' + ids.join(',')
                https.get(
                    itUrl,
                    function(nResponse) {
                        // Continuously update stream with data
                        var nbody = '';
                        nResponse.on('data', function(nd) {
                            nbody += nd;
                        });
                        nResponse.on('end', function() {
                            //got names
                            parsedName = JSON.parse(nbody);
                            for (var i = 0; i < parsedName.length; i++) {
                                for (var j = 0; j < parsedPrice.length; j++) {
                                    if (parsedName[i].id == parsedPrice[j].id) {
                                        //same item, add name to price
                                        var desc = parsedName[i].desc || parsedName[i].details ? parsedName[i].details.description : parsedName[i].type;
                                        parsedPrice[j].name = parsedName[i].name;
                                        parsedPrice[j].desc = desc;
                                    }
                                }
                            }
                            // console.log('Prices:', parsedPrice);
                            //got all item names and prices, so now let's upsert them. ermahgerd, upsert.
                            parsedPrice.forEach(function(el) {
                                var query = { 'item_id': el.id };
                                var data = { 'name': el.name, 'item_id': el.id, 'min': el.buys.unit_price, 'max': el.sells.unit_price, 'desc': el.desc, 'status': 'none' };
                                // console.log('QUERY', query, 'DATA', data)
                                mongoose.model('Item').findOneAndUpdate(query, data, { upsert: true }, function(err, doc) {
                                    if (err) {
                                        console.log('Error updating:', err);
                                    } else {
                                        // console.log('Doc saved:', doc);
                                    }
                                });
                            })
                        });
                        nResponse.on('error', function(e) {
                            console.log('Error occured! ', e)
                        })
                    });
            });
            response.on('error', function(e) {
                console.log('Error occured! ', e)
            })
        });
}

// module.exports = { "Item": Item, "Usr": Usr };
