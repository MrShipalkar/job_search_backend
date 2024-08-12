const express = require("express");
const router = express.Router();
const Job = require("../../schemas/job");

router.post("/create", async (req, res, next) => {
  try {
    const {
      name,
      logo,
      position,
      salary,
      jobType,
      remote,
      description,
      about,
      skills,
      information,
    } = req.body;
    const user = req.user;
    const userId = user._id;
    const skillsArray = skills.split(",").map((skill) => skill.trim());
    const job = new Job({
      name,
      logo,
      position,
      salary,
      jobType,
      remote,
      description,
      about,
      skills: skillsArray,
      information,
      userId,
    });
    await job.save();
    res.status(200).send("Job created successfully");
  } catch (err) {
    next(err);
  }
});

router.delete("/delete/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const userId = req.user._id;
    const defaultJob = await Job.findById(id);
    if (defaultJob.userId.toString() !== userId.toString()){
      return res.status(403).send("You don't have permission to delete this job");
    }
    if (!id) {
      return res.status(403).send("wrong request");
    }
    await Job.findByIdAndDelete(id);
    res.status(200).send("Job deleted successfully");
  } catch (err) {
    next(err);
  }
});

router.get("/get/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(403).send("wrong request");
    }
    const job = await Job.findById(id);
    res.status(200).json(job);
  } catch (err) {
    next(err);
  }
});

router.get("/all", async (req, res, next) => {
  try {
    const jobs = await Job.find().select("name logo position");
    res.status(200).json(jobs);
  } catch (err) {
    next(err);
  }
});

//Updating a job

router.patch("/update/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(403).send("wrong request");
    }
    const {
      name,
      logo,
      position,
      salary,
      jobType,
      remote,
      description,
      about,
      skills,
      information,
    } = req.body;
    const user = req.user;
    const userId= user._id;
    const defaultJob = await Job.findById(id);
    if(defaultJob.userId.toString() !== userId.toString()){
      return res.status(403).send("You are not the owner of this job");
    }
    const skillsArray =
      skills?.split(",").map((skill) => skill.trim()) || defaultJob.skills;
    const job = await Job.findByIdAndUpdate(
      id,
      {
        name: name || defaultJob.name,
        logo: logo || defaultJob.logo,
        position: position || defaultJob.position,
        salary: salary || defaultJob.salary,
        jobType: jobType || defaultJob.jobType,
        remote: remote || defaultJob.remote,
        description: description || defaultJob.description,
        about: about || defaultJob.about,
        skills: skillsArray,
        information: information || defaultJob.information,
      },
      { new: true }
    );
    res.status(200).json(job);
  } catch (err) {
    next(err);
  }
});

//filtering based on skills

router.get("/filter/:skills", async (req, res, next) => {
  try {
    const skills = req.params.skills;
    if (!skills) {
      return res.status(403).send("wrong request");
    }
    const skillsArray = skills.split(",").map((skill) => skill.trim());
    const jobs = await Job.find({ skills: { $in: skillsArray } }).select(
      "name logo position"
    );
    res.status(200).json(jobs);
  } catch (err) {
    next(err);
  }
});

// searching based on name, position, jobtype

router.get("/search/:query", async (req, res, next) => {
  try {
    const query = req.params.query;
    const jobs = await Job.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { position: { $regex: query, $options: "i" } },
        { jobType: { $regex: query, $options: "i" } },
        {discription:{$regex: query,$options:"i"}}
      ],
    }).select("name logo position");
    res.status(200).json(jobs);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
