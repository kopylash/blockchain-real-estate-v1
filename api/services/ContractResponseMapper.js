module.exports = {
    mapEnlistment(response) {
        return {
            streetName: response[0],
            floor: parseInt(response[1]),
            apartment: parseInt(response[2]),
            house: parseInt(response[3]),
            zipCode: parseInt(response[4])
        };
    }
};
