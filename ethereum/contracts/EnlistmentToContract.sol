pragma solidity ^0.4.18;
contract EnlistmentToContract {

    address owner;
    string landlord;
    bool public locked = false;
    Enlistment enlistment;
    mapping(string => Offer) tenantOfferMap;
    mapping(string => AgreementDraft) tenantAgreementMap;

    function EnlistmentToContract(string landlordEmail, string streetName, int floorNr, int apartmentNr, int houseNr, int postalCode) public
    {
        enlistment = Enlistment(streetName, floorNr, apartmentNr, houseNr, postalCode);
        landlord = landlordEmail;
        owner = msg.sender;
    }

    function getOwner() view public ownerOnly() returns (address) {
        return owner;
    }

    function getLandlord() view public ownerOnly() returns (string) {
        return landlord;
    }

    function getEnlistment() view public ownerOnly() returns (string, int, int, int, int) {
        return (enlistment.streetName, enlistment.floorNr, enlistment.apartmentNr, enlistment.houseNr, enlistment.postalCode);
    }

    enum OfferStatus {
        PENDING,
        REJECTED,
        CANCELLED,
        ACCEPTED
    }

    enum AgreementStatus {
        UNINITIALIZED, // internal
        PENDING,
        REJECTED,
        CONFIRMED,
        CANCELLED,
        LANDLORD_SIGNED,
        TENANT_SIGNED,
        COMPLETED
    }

    struct Enlistment {
        string streetName;
        int floorNr;
        int apartmentNr;
        int houseNr;
        int postalCode;
    }

    struct Offer {
        bool initialized;
        int amount;
        string tenantName;
        string tenantEmail;
        OfferStatus status;
    }

    struct AgreementDraft {
        string landlordName; // for simplicity, there is only one landlord
        string tenantName; // for simplicity, there is only one tenant and occupants are omitted
        string tenantEmail;
        int amount;
        uint leaseStart;
        uint handoverDate;
        uint leasePeriod;
        string otherTerms;
        string hash;
        string landlordSignedHash;
        string tenantSignedHash;
        AgreementStatus status;
    }

    modifier noActiveOffer(string tenantEmail) {
        require(tenantOfferMap[tenantEmail].initialized == false || tenantOfferMap[tenantEmail].status == OfferStatus.REJECTED || tenantOfferMap[tenantEmail].status == OfferStatus.CANCELLED);
        _;
    }

    modifier offerExists(string tenantEmail) {
        require(tenantOfferMap[tenantEmail].initialized == true);
        _;
    }

    modifier offerInStatus(OfferStatus status, string tenantEmail) {
        require(tenantOfferMap[tenantEmail].status == status);
        _;
    }

    modifier offerCancellable(string tenantEmail) {
        var offerStatus = tenantOfferMap[tenantEmail].status;
        require(offerStatus == OfferStatus.PENDING || offerStatus == OfferStatus.ACCEPTED);
        var agreementStatus = tenantAgreementMap[tenantEmail].status;
        require(!(agreementStatus == AgreementStatus.CANCELLED || agreementStatus == AgreementStatus.TENANT_SIGNED || agreementStatus == AgreementStatus.COMPLETED));
        _;
    }

    modifier agreementCanBeSubmitted(string tenantEmail) {
        require(tenantAgreementMap[tenantEmail].status == AgreementStatus.UNINITIALIZED ||
        tenantAgreementMap[tenantEmail].status == AgreementStatus.REJECTED || tenantAgreementMap[tenantEmail].status == AgreementStatus.CANCELLED);
        _;
    }

    modifier agreementInStatus(AgreementStatus status, string tenantEmail) {
        require(tenantAgreementMap[tenantEmail].status == status);
        _;
    }

    modifier agreementCancellable(string tenantEmail) {
        var agreementStatus = tenantAgreementMap[tenantEmail].status;
        require(!(agreementStatus == AgreementStatus.CANCELLED || agreementStatus == AgreementStatus.TENANT_SIGNED || agreementStatus == AgreementStatus.COMPLETED || agreementStatus == AgreementStatus.REJECTED));
        _;
    }

    modifier notLocked() {
        require(!locked);
        _;
    }

    modifier ownerOnly() {
        require(msg.sender == owner);
        _;
    }

    // what if the offer is in status PENDING and the tenant wants to send a new one?
    function sendOffer(int amount, string tenantName, string tenantEmail) payable public
        ownerOnly()
        noActiveOffer(tenantEmail)
        notLocked()
    {
        var offer = Offer({
            initialized: true,
            amount: amount,
            tenantName: tenantName,
            tenantEmail: tenantEmail,
            status: OfferStatus.PENDING
        });
        tenantOfferMap[tenantEmail] = offer;
    }

    function cancelOffer(string tenantEmail) payable public
        ownerOnly()
        offerExists(tenantEmail)
        offerCancellable(tenantEmail)
    {
        tenantOfferMap[tenantEmail].status = OfferStatus.CANCELLED;
        if (tenantAgreementMap[tenantEmail].status != AgreementStatus.UNINITIALIZED) {
            tenantAgreementMap[tenantEmail].status = AgreementStatus.CANCELLED;
        }
        locked = false;
    }

    function getOffer(string tenantEmail) view public ownerOnly() returns (bool, int, string, string, OfferStatus) {
        var o = tenantOfferMap[tenantEmail];
        return (o.initialized, o.amount, o.tenantName, o.tenantEmail, o.status);
    }

    function reviewOffer(bool result, string tenantEmail) payable public
        ownerOnly()
        offerExists(tenantEmail)
        offerInStatus(OfferStatus.PENDING, tenantEmail)
    {
        tenantOfferMap[tenantEmail].status = result ? OfferStatus.ACCEPTED : OfferStatus.REJECTED;
    }

    function submitDraft(string tenantEmail, string landlordName, string agreementTenantName, string agreementTenantEmail,
        uint leaseStart, uint handoverDate, uint leasePeriod, string otherTerms, string hash) payable public
        ownerOnly()
        offerExists(tenantEmail)
        offerInStatus(OfferStatus.ACCEPTED, tenantEmail)
        agreementCanBeSubmitted(tenantEmail)
    {
        var amount = tenantOfferMap[tenantEmail].amount;
        tenantAgreementMap[tenantEmail] = AgreementDraft(landlordName,
            agreementTenantName, agreementTenantEmail,
            amount, leaseStart,
            handoverDate, leasePeriod,
            otherTerms, hash, "", "", AgreementStatus.PENDING);
    }

    // getAgreement functions:
    // can only return tuple of max 7 elements, otherwise throws "Stack too geep"
    // solution: splitted into multiple functions

    function getAgreementParticipants(string tenantEmail) view public ownerOnly() returns (string, string, string) {
        var a = tenantAgreementMap[tenantEmail];
        return (a.landlordName, a.tenantName, a.tenantEmail);
    }

    function getAgreementDetails(string tenantEmail) view public ownerOnly() returns (int, uint, uint, uint, string) {
        var a = tenantAgreementMap[tenantEmail];
        return (a.amount, a.leaseStart, a.handoverDate, a.leasePeriod, a.otherTerms);
    }

    function getAgreementHashes(string tenantEmail) view public ownerOnly() returns (string, string, string) {
        var a = tenantAgreementMap[tenantEmail];
        return (a.hash, a.landlordSignedHash, a.tenantSignedHash);
    }

    function getAgreementStatus(string tenantEmail) view public ownerOnly() returns (AgreementStatus) {
        var a = tenantAgreementMap[tenantEmail];
        return (a.status);
    }

    function reviewAgreement(string tenantEmail, bool result) payable public
        ownerOnly()
        offerExists(tenantEmail)
        offerInStatus(OfferStatus.ACCEPTED, tenantEmail)
        agreementInStatus(AgreementStatus.PENDING, tenantEmail)
    {
        tenantAgreementMap[tenantEmail].status = result ? AgreementStatus.CONFIRMED : AgreementStatus.REJECTED;
    }

    function landlordSignAgreement(string tenantEmail, string landlordSignedHash) payable public
        ownerOnly()
        notLocked()
        offerExists(tenantEmail)
        offerInStatus(OfferStatus.ACCEPTED, tenantEmail)
        agreementInStatus(AgreementStatus.CONFIRMED, tenantEmail)
    {
        tenantAgreementMap[tenantEmail].landlordSignedHash = landlordSignedHash;
        tenantAgreementMap[tenantEmail].status = AgreementStatus.LANDLORD_SIGNED;
        locked = true;
    }

    function tenantSignAgreement(string tenantEmail, string tenantSignedHash) payable public
        ownerOnly()
        offerExists(tenantEmail)
        offerInStatus(OfferStatus.ACCEPTED, tenantEmail)
        agreementInStatus(AgreementStatus.LANDLORD_SIGNED, tenantEmail)
    {
        tenantAgreementMap[tenantEmail].tenantSignedHash = tenantSignedHash;
        tenantAgreementMap[tenantEmail].status = AgreementStatus.TENANT_SIGNED;
    }

    function cancelAgreement(string tenantEmail) payable public
        ownerOnly()
        agreementCancellable(tenantEmail)
    {
        tenantAgreementMap[tenantEmail].status = AgreementStatus.CANCELLED;
        locked = false;
    }

    function receiveFirstMonthRent(string tenantEmail) payable public
        ownerOnly()
        offerExists(tenantEmail)
        offerInStatus(OfferStatus.ACCEPTED, tenantEmail)
        agreementInStatus(AgreementStatus.TENANT_SIGNED, tenantEmail)
    {
        tenantAgreementMap[tenantEmail].status = AgreementStatus.COMPLETED;
    }
}
