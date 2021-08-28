import { Request, Response } from "express";
/*
This is our middleware function that:
    * Takes a model
    * Get the required results
    * return the results
    * call next() -> To execute the next middleware
*/
const fetchResults = (model: any) => {
  return async (req: Request, res: Response | any, next: any) => {
    const page: number = Number.parseInt((req.query as any).page);
    const limit: number = Number.parseInt((req.query as any).limit);
    const results: any = {};
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    if (endIndex < (await model.countDocuments().exec())) {
      results.next = {
        page: page + 1,
        limit: limit,
      };
    }
    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit,
      };
    }
    try {
      results.results = await model.find({}).limit(limit).skip(endIndex).exec();
      res.paginatedResults = results;
      next();
    } catch (error) {
      res.status(500).json({
        code: 500,
        error,
      });
    }
  };
};

export default fetchResults;
