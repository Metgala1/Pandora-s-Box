exports.isAuthenticated = async (req, res, next) => {
    try {
        if (req.isAuthenticated()) {
            return next();
        }
        req.flash("error", "You must be logged in");
        res.redirect("/login");
    } catch (err) {
        console.error("Auth check failed:", err);
        req.flash("error", "Something went wrong. Please try again.");
        res.redirect("/login");
    }
};
