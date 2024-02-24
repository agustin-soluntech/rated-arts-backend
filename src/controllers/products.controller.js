export const createProducts = async (req, res) => {
    console.log(req.body)
    res.send('Products created');
}