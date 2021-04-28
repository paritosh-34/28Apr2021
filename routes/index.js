const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const User = require("../models/User");

router.get("/", (_req, res) => {
  return res.redirect("/create");
});

router.get("/create", (_req, res) => {
  return res.render("create");
});

router.post("/create", async (req, res) => {
  const { name, age, email, address, phone } = req.body;

  let errors = [];

  if (!name || !email || !address || !phone || !age) {
    errors.push({ msg: "Please enter all fields" });
  }

  if (phone.length !== 10) {
    errors.push({ msg: "Phone must be 10 digits" });
  }

  if (name.length < 6) {
    errors.push({ msg: "Name must be at least 6 characters" });
  }

  if (age <= 1) {
    errors.push({ msg: "Age must be more than 1" });
  }

  if (errors.length > 0) {
    return res.render("create", {
      errors,
      name,
      email,
      age,
      phone,
      address,
    });
  } else {
    try {
      const r = await User.findOne({ phone: phone });

      if (r) {
        errors.push({ msg: "User with the same phone number already exists" });
        return res.render("create", {
          errors,
          name,
          email,
          age,
          phone,
          address,
        });
      } else {
        const newUser = new User({
          name: name,
          email: email,
          age: age,
          phone: phone,
          address: address,
        });

        await newUser.save();

        req.flash("success_msg", "User successfully created");
        return res.redirect("/manage");
      }
    } catch (e) {
      console.log("Errer in create:", e);

      errors.push({ msg: "Something went wrong" });
      return res.render("edit", {
        errors,
        name,
        email,
        age,
        phone,
        address,
      });
    }
  }
});

module.exports = router;
