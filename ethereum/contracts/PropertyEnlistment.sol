pragma solidity ^0.4.18;

contract PropertyEnlistment {
  string public landlordName;
  int public price;

  enum OfferStatus { PENDING, ACCEPTED, REJECTED }
  struct Offer {
    int amount;
    string tenantName;
    string tenantEmail;
    OfferStatus status;
  }

  Offer[] public offers;

  event OfferReceived();

  function PropertyEnlistment(string _landlordName, int _price) public {
    landlordName = _landlordName;
    price = _price;
  }

  function receiveOffer(int amount, string tenantName, string tenantEmail) public {
    var lastOffer = Offer(amount, tenantName, tenantEmail, OfferStatus.PENDING);
    offers.push(lastOffer);

    OfferReceived();
  }

  function getNumberOfOffers() public view returns(int) {
    return int(offers.length);
  }
}
