import { Request, Response, NextFunction } from "express";

const hostValidator = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const availableOrigins: string[] = [
      "http://localhost:9000/",
      "http://localhost:9200/",
      "https://app.motowork.xyz/",
      "http://localhost:9001/",
    ];

    const referer = req.get("Referer");
    console.log(referer);

    // Verificar si el origen está permitido
    if (!referer || !availableOrigins.includes(referer)) {
      res.status(403).send("Acceso no permitido desde este origen");
      return;
    }

    next();
  } catch (error) {
    res.status(403).send("No puedes acceder a esta solicitud");
  }
};

export default hostValidator;
