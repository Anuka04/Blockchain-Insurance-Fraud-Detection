// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.5.0;
pragma experimental ABIEncoderV2;

contract Insurance {
    // Define the entities
    address public user;
    address public insuranceCompany;
    address public hospital;

    // Define the policy details
    uint public policyAmount;
    uint public premium;
    uint public startDate;
    uint public endDate;

    // Define the policy status
    enum PolicyStatus {
        Active,
        Inactive,
        Claimed
    }
    PolicyStatus public status;

    //Define the amount that has to be claimed
    uint public claimAmt;

    // Define the list of medical procedures and their timestamps
    struct Procedure {
        string name;
        uint timestamp;
    }
    Procedure[] public procedures;

    // Define the constructor function to initialize the policy details
    constructor() public {
        createIns(
            user,
            insuranceCompany,
            hospital,
            policyAmount,
            premium,
            startDate,
            endDate
        );
    }

    function createIns(
        address _user,
        address _insuranceCompany,
        address _hospital,
        uint _policyAmount,
        uint _premium,
        uint _startDate,
        uint _endDate
    ) public {
        user = 0x823c6b98674B1C14Dad43464B756b95B55aA8858;
        insuranceCompany = 0x30704AC12b41CFB38Fdcd5eCb83f177bFbA1C004;
        hospital = 0x410b4dae16798555f9DBE24206ae795B0ce019Af;
        policyAmount = 100;
        premium = 2;
        startDate = 100;
        endDate = 200;
        status = PolicyStatus.Active;
    }

    // Define the function for the user to record the amount they want to claim
    function makeClaim(uint _claimAmt) public {
        require(msg.sender == user, "Only the user can set the policy amount.");
        claimAmt = _claimAmt;
    }

    // Define the function for the hospital to record a medical procedure and its timestamp
    function recordProcedure(string memory _name, uint _timestamp) public {
        require(
            msg.sender == hospital,
            "Only the hospital can record a procedure."
        );
        require(
            status == PolicyStatus.Claimed,
            "The policy must be claimed to record a procedure."
        );
        require(
            _timestamp > startDate,
            "The time of procedure should be after start date."
        );
        require(
            _timestamp < endDate,
            "The time of procedure should before end date."
        );
        procedures.push(Procedure(_name, _timestamp));
    }

    function getProcedures() public view returns (Procedure[] memory) {
        return procedures;
    }

    // Define the function for the user to make a claim
    function claim() public {
        require(
            msg.sender == user,
            "Only the user can claim the policy amount."
        );
        require(
            status == PolicyStatus.Active || status == PolicyStatus.Claimed,
            "The policy must be active or claimed to make a claim."
        );
        require(
            claimAmt <= policyAmount,
            "The claim must be less than or equal to the policy amount."
        );
        status = PolicyStatus.Claimed;
        // payable(user).transfer(policyAmount);
    }

    function acceptClaim() public {
        require(
            msg.sender == insuranceCompany,
            "Only the Insurance Company can accept the claim."
        );
        require(
            status == PolicyStatus.Claimed,
            "Claim must be made to accept it"
        );
        policyAmount = policyAmount - claimAmt;
        status == PolicyStatus.Active;
        if (policyAmount == 0) {
            status = PolicyStatus.Inactive;
        }
    }

    function rejectClaim() public {
        require(
            msg.sender == insuranceCompany,
            "Only the Insurance Company can reject the claim."
        );
        require(
            status == PolicyStatus.Claimed,
            "Claim must be made to reject it"
        );
        status = PolicyStatus.Active;
    }

    // Define the function to check the status of the policy
    function getStatus() public view returns (string memory) {
        if (status == PolicyStatus.Claimed) {
            return "Claimed";
        } else if (status == PolicyStatus.Inactive) {
            return "Inactive";
        } else {
            return "Active";
        }
    }
}
