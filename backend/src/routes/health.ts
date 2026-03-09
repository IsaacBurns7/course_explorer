import express, {Request, Response } from "express";

const router = express.Router();

router.get("/level1", async (req:Request, res:Response) => {
    res.status(200).send({"STATUS": "HEALTHY"});
})

module.exports = router;