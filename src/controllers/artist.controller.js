import { Artist } from "../models/Artist.js";

export const getAllArtists = async (req, res) => {
  const artist = await Artist.findAll();
  res.json(artist);
};
