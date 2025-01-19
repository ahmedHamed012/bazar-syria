const generateUniqueMemberId = async (UserModel) => {
  let isUnique = false;
  let memberId;

  while (!isUnique) {
    // Generate a random 7-digit number
    memberId = Math.floor(1000000 + Math.random() * 9000000); // Ensures a 7-digit number

    // Check if the memberId already exists in the database
    const existingUser = await UserModel.findOne({ memberId });
    if (!existingUser) {
      isUnique = true; // The memberId is unique
    }
  }

  return memberId;
};

module.exports = generateUniqueMemberId;
