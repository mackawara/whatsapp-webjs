const queryAndSave = async function (model, item, queryString, itemId) {
  const stringified = `${queryString}`;
  console.log(itemId, stringified);
  const result = await model
    .find({
      [queryString]: itemId,
    })
    .exec();

  if (result.length < 1) {
    try {
      item.save().then(() => console.log("now saved"));
    } catch (error) {
      console.error(error);
    }
  } else {
    console.log("item saved already");
  }
};
module.exports = queryAndSave;
