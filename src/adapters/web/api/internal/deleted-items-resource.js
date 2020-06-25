module.exports.init = (app, log, deleted) => {
    app.get('/news/items/deleted', async (req, res) => {
        res.status(200).json(await deleted.list());
    });

    app.get('/news/items/deleted/count', async (req, res) => {
        res.status(200).json(await deleted.count());
    });
}