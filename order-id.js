const order = require('./models/order');
const moment = require('moment');

const CreatebillId = async (next) => {
  const year = moment().format('YY'); // Get the last two digits of the current year

  try {
    const latestRequest = await order.findOne({})
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order
      .exec();

    let currentId = 0;
    if (latestRequest) {
      const latestId = latestRequest.billId;
      const latestYear = latestId.split('_')[0].split('-')[1];

      if (year === latestYear) {
        currentId = parseInt(latestId.split('_')[1], 10);
      }
    }

    currentId += 1;

    const formattedId = `CR-${year}_${currentId.toString().padStart(4, '0')}`;

    return formattedId;
  } catch (error) {
   console.log("error" , error)
  }
};

const billId = async () => {
  const newId = await CreatebillId();
  return newId;
};

module.exports = billId;
