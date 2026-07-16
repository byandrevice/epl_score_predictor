const Fixture = require("../models/Fixture");
const demoSimulationService = require("./demoSimulationService");

const watchFixtures = () => {

  const changeStream = Fixture.watch();

  changeStream.on("change", async (change) => {

    if (change.operationType === "update") {

      const updatedFields = change.updateDescription.updatedFields;

      if (
        updatedFields.finalHomeScore !== undefined ||
        updatedFields.finalAwayScore !== undefined
      ) {

        console.log(
          "Final score changed. Calculating points..."
        );

        try {
            await demoSimulationService.calculatePoints(
                change.documentKey._id
            );

            console.log("Points updated!");

        } catch (error) {
            console.error(
                "Point calculation failed:",
                error.message
            );
        }

        console.log(
          "Points updated!"
        );
      }
    }

  });

};

module.exports = watchFixtures;