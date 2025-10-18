const sendUpdatedDocResponse = (req, res) => {
  console.log('send res');
  res.status(200).json({ data: res.locals.updatedDocument });
};

module.exports = {
  sendUpdatedDocResponse,
};
