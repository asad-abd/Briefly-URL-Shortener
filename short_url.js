    const longUrl = req.params.longUrl;
    var crypto = require('crypto');
    
    var hash = crypto.createHash('md5').update(longUrl).digest('hex');
    function idTochar(n) {

        let map = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.-";
        return map[n];
    }

    function hexByteStringToBitArray(hexByteString) {
        var bits = [];
        for (var i = 0; i < hexByteString.length;) {
            var hexByte = hexByteString[i++] + hexByteString[i++];
            var byte = parseInt(hexByte, 16);
            for (var j = 7; j >= 0; j--) {
                var bit = (byte >> j) & 0x1;
                bits.push(bit);
            }
        }
        return bits;
    }
    bit_array = hexByteStringToBitArray(hash);
    let char_base64 = [];
    for (let i = 0; i < 21; i++) {
        let num = 0;
        for (let j = 0 + i * 6; j < i * 6 + 6; j++) {
            num = num + Math.pow(2, 5 - (j - i * 6)) * bit_array[j];
        }
        char_base64.push(idTochar(num));
    }
  console.log(char_base64);

    for (let i = 0; i < 15; i++) {
        let stg = "";
        for (let j = 0; j < 6; j++) {
            stg = stg.concat(char_base64[j + i]);
        }
        console.log("how many time");
        try {
            const item =  await getLongUrl(stg);
            console.log(item);
            if (item['Item']['long'] == longUrl) {
                res.json(item);
                console.log("same Url ");
                break;
            }
        } catch (err) {
            const item = { short: stg, long: longUrl };
            const newItem = await addOrUpdateUrl(item);
            res.json(newItem);
            break;
        }
    }
