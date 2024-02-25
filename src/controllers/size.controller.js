import { Size } from "../models/Size.js";

export const getProportionalSizes = async (req, res) => {
  const { width, height } = req.body;
  const aspectRatio = width / height;

  try {
    const allSizes = await Size.findAll({
      raw: true,
    });

    const proportionalSizes = allSizes.filter((size) => {
      const sizeAspectRatio = size.width / size.height;
      return Math.abs(sizeAspectRatio - aspectRatio) < 0.05; // Ajusta el 0.05 según tu criterio
    });

    res.json(proportionalSizes);
  } catch (error) {
    res.status(500).send("Error al obtener tamaños proporcionales");
  }
};
