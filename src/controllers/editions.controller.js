import { Editions } from "../models/Editions.js";

export const getEditions = (req, res) => {
    Editions.findAll().then(editions => {
        res.json(editions);
    });
};