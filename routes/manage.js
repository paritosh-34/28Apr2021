const express = require("express");
const router = express.Router();

const User = require("../models/User");

router.get("/", async (req, res) => {
  try {
    let users = await User.find().lean();
    if (users.length === 0) users = undefined;

    return res.render("manage", {
      users: users,
    });
  } catch (e) {
    let errors = [];
    errors.push({ msg: "Something went wrong" });

    return res.render("manage", {
      errors,
    });
  }
});

router.get("/:phone", async (req, res) => {
  try {
    const phone = req.params.phone;

    const user = await User.findOne({ phone: phone });

    if (!user) {
      return res.render("notfound");
    }

    return res.render("edit", {
      name: user.name,
      email: user.email,
      age: user.age,
      phone: user.phone,
      address: user.address,
    });
  } catch (error) {
    console.log("/:phone", error);

    return res.render("wentwrong");
  }
});

router.post("/edit/:phone", async (req, res) => {
  const originalPhone = req.params.phone;
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
  if (age > 200) {
    errors.push({ msg: "Age must be less than 200" });
  }

  if (errors.length > 0) {
    return res.render("edit", {
      errors,
      name,
      email,
      age,
      phone,
      address,
    });
  } else {
    try {
      if (originalPhone != phone) {
        const r = await User.findOne({ phone: phone });

        if (r) {
          errors.push({
            msg: "User with the same phone number already exists",
          });
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
      const user = await User.findOne({ phone: originalPhone });

      user.phone = phone;
      user.name = name;
      user.email = email;
      user.age = age;
      user.address = address;

      user.save();

      req.flash("success_msg", "User successfully edited");
      return res.redirect("/manage");
    } catch (e) {
      console.log("Error in edit:", e);

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

router.post("/delete/:phone", async (req, res) => {
  const phone = req.params.phone;

  try {
    const r = await User.findOneAndDelete({ phone: phone });

    if (!r) {
      req.flash("error", "User not found");
      return res.redirect("/manage");
    }

    req.flash("success_msg", "User successfully Deleted");
    return res.redirect("/manage");
  } catch (e) {
    req.flash("error", "Something went wrong");
    return res.redirect("/manage");
  }
});

router.post("/search", async (req, res) => {
  const { name } = req.body;

  try {
    let users = await User.find({ name: name }).lean();
    let errors = [];

    if (users.length === 0) {
      users = undefined;
      errors.push({ msg: "No user found with that name" });
    }

    return res.render("manage", {
      errors,
      users: users,
    });
  } catch (e) {
    let errors = [];
    errors.push({ msg: "Something went wrong" });

    return res.render("manage", {
      errors,
    });
  }
});

module.exports = router;
