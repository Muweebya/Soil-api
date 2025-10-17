const express = require("express");
const router = express.Router();
const passport = require("passport");
// Import the Registration model with consistent capitalization
const Registration = require("../models/Registration");

// Define authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login'); // Redirect to login page if not authenticated
};

router.get("/register", (req, res) => {
    res.render("registration");
});

router.post("/register", async (req, res) => {
    try {
        const user = new Registration(req.body);
        let existingUser = await Registration.findOne({
            emailaddress: req.body.emailaddress
        });
        
        if (existingUser) {
            return res.status(400).render("registration", {
                error: "Email already exists",
                formData: req.body
            });
        }
        
        Registration.register(user, req.body.password)
            .then(() => {
                res.redirect("/login");
            })
            .catch(error => {
                console.error("Registration error:", error);
                res.status(400).render("registration", {
                    error: "Registration failed",
                    formData: req.body
                });
            });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(400).render("registration", {
            error: "Registration failed",
            formData: req.body
        });
    }
});

router.get("/login", (req, res) => {
    res.render("login");
});

router.post("/login", passport.authenticate("local", { failureRedirect: "/login" }), (req, res) => {
    console.log("User logged in:", req.user.username);
    const role = req.user.role;
   // e.g., "Matugga" or "Maganjo"
    
    if (role === "farmer") {
         res.redirect("/farmerDash");
         
    }
    else{
        res.render("error", { message: "You don't have any role in the system." });
    }
});

    
router.get("/logout", (req, res) => {
    if (req.session) {
        req.session.destroy((error) => {
            if (error) {
                console.error("Logout error:", error);
                return res.status(500).render("error", { message: "Error logging out" });
            }
            res.redirect("/");
        });
    } else {
        res.redirect("/");
    }
});

router.get("/usersList", isAuthenticated, async (req, res) => {
    try {
        const users = await Registration.find().sort({$natural: -1});
        res.render("usersList", {
            users: users
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(400).render("error", { message: "Unable to find users in the database" });
    }
});

router.get("/updateUser/:id", isAuthenticated, async (req, res) => {
    try {
        const updateUser = await Registration.findOne({_id: req.params.id});
        if (!updateUser) {
            return res.status(404).render("error", { message: "User not found" });
        }
        res.render("updateusers", {user: updateUser});
    } catch (error) {
        console.error("Error finding user:", error);
        res.status(400).render("error", { message: "Unable to find user in the database" });
    }
});

router.post("/updateUser/:id", isAuthenticated, async (req, res) => {
    try {
        console.log("Update user request received for ID:", req.params.id);
        
        const updateUser = await Registration.findOneAndUpdate(
            {_id: req.params.id},
            req.body,
            {new: true}
        );
        
        if (!updateUser) {
            return res.status(404).render("error", { message: "User not found for update" });
        }
        
        console.log("Updated user:", updateUser);
        res.redirect("/usersList");
    } catch (error) {
        console.error("Update error:", error);
        res.status(400).render("error", { message: "Unable to update user in the database" });
    }
});

router.post("/deleteUser", isAuthenticated, async (req, res) => {
    try {
        const result = await Registration.deleteOne({_id: req.body.id});
        
        if (result.deletedCount === 0) {
            console.log("No user found to delete");
        } else {
            console.log("User deleted successfully");
        }
        
        res.redirect("/usersList");
    } catch (error) {
        console.error("Delete error:", error);
        res.status(400).render("error", { message: "Unable to delete user from the database" });
    }
});

module.exports = router;