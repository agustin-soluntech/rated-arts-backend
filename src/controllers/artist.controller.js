import { Artists } from "../models/Artists.js";

export const getAllArtists = async (req, res) => {
  const artist = await Artists.findAll();
  res.json(artist);
};
