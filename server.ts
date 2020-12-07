import express from 'express';

const app = express();
app.use(express.static(__dirname + '/dist'));

const port = process.env.PORT ?? 4000;

app.listen(port, () => {
	console.log(`Gameserver listening on port ${port}`);
});
