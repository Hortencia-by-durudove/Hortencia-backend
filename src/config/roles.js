const allUserRights = ["getUsers", "manageUsers", "manageContacts", "manageBookings"];
const userRoleRights = {
  user: [],
  admin: ["getUsers", "manageUsers", "manageContacts", "manageBookings"],
  superAdmin: ["getUsers", "manageUsers", "manageContacts", "manageBookings"],
};

const userRoles = Object.keys(userRoleRights);

module.exports = {
  allUserRights,
  userRoles,
  userRoleRights,
};
