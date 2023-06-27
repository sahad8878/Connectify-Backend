
const path = require("path");
const User = require("../models/user");
const City = require("../models/city");

// get User Details
const getUserDetails = (req, res) => {
  try {
    res.send(req.user);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: `getUserDetails controller ${error.message}`,
    });
  }
};

// post user details
const postUserDetails = async (req, res) => {
  try {
    const fileName = req.file.filename;
    const filePath = `uploads/${fileName}`;
    const fileUrl = path.join(fileName);
    const user = await User.findByIdAndUpdate(req.user._id, {
      $set: { profileImg: fileUrl },
    });
    let regExp = new RegExp(req.body.city.trim(), "i");
    let city1 = await City.findOne({
      city: { $regex: regExp },
    });

    if (city1) {
      if (!city1.users.includes(req.user._id)) {
        city1.users.push(req.user._id);
        await city1.save();
        return res.status(201).json({ city1, success: true });
      } else {
        return res.status(201).json({ success: false });
      }
    } else {
      const city = new City(req.body);
      city.users.push(req.user._id);
      await city.save().then((city) => {
        res.status(201).json({ city, success: true });
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: `postUserDetials controller ${error.message}`,
    });
  }
};

// get natives details
const getNativesDetails = async (req, res) => {
  try {

    const city = await City.aggregate([
      {
        $match: {
          users: req.user._id,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "users",
          foreignField: "_id",
          as: "populatedUsers",
        },
      },
      {
        $addFields: {
          populatedUsers: {
            $filter: {
              input: "$populatedUsers",
              cond: {
                $ne: ["$$this._id", req.user._id],
              },
            },
          },
        },
      },
    ]);
    if (city.length !== 0) {
      res.status(201).json({ city: city[0].populatedUsers, success: true });
    } else {
      res.status(200).json({ success: false });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: `getNativesDetails controller ${error.message}`,
    });
  }
};

// get search results

const getSearchData = async (req, res) => {
  try {
    let searchData = req.query.search;
    const search = await City.findOne({
      city: { $regex: new RegExp(`^${searchData}.*`, "i") },
    }).populate("users");
    res.json({ search: search?.users });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: `getSearchData controller ${error.message}`,
    });
  }
};

module.exports = {
  getUserDetails,
  postUserDetails,
  getNativesDetails,
  getSearchData,
};
