const express = require('express');
const app = express();
const {
    getLongUrl,
    addOrUpdateUrl,
    deleteUrl,
} = require('./dynamo');

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Welcome to briefly - URL shortner!');
});

app.get('/:shortUrl', async (req, res) => {
    const shortUrl = req.params.shortUrl;
    try {
        const item = await getLongUrl(shortUrl);
        //add http redirect here (to the long url)
        console.log(item);
        res.json(item);
    } catch (err) {
        console.error(err);
        res.status(500).json({ err: 'Something went wrong' });
    }
});

app.put('/shorten/:longUrl', async (req, res) => {
    const longUrl = req.params.longUrl;
    //generate the shortURL here

    //get expiry date in unix epoch timestamp
    var today = new Date();
    const expiryDate = Math.floor(new Date(new Date().setDate(today.getDate() + 30)).getTime() / 1000)

    const item = {short : longUrl, long : longUrl, expiry : expiryDate};


    try {
        const newItem = await addOrUpdateUrl(item);
        res.json(newItem);
    } catch (err) {
        console.error(err);
        res.status(500).json({ err: 'Something went wrong' });
    }
});

/*app.delete('/characters/:id', async (req, res) => {
    const { id } = req.params;
    try {
        res.json(await deleteCharacter(id));
    } catch (err) {
        console.error(err);
        res.status(500).json({ err: 'Something went wrong' });
    }
});*/

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`listening on port `+ port);
});