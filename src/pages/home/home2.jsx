import React, { useState, useEffect } from "react";
import Web3 from "web3";
import InsuranceContract from "../../contracts/Insurance.json";

const App = () => {
  const [web3, setWeb3] = useState(undefined);
  const [accounts, setAccounts] = useState([]);
  const [insuranceContract, setInsuranceContract] = useState(undefined);
  const [policyAmount, setPolicyAmount] = useState("");
  const [premium, setPremium] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [claimAmt, setClaimAmt] = useState("");
  const [procedureName, setProcedureName] = useState("");
  const [procedureTimestamp, setProcedureTimestamp] = useState("");
  const [selectedAccountIndex, setSelectedAccountIndex] = useState(0);

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
          await window.ethereum.enable();
          setWeb3(web3);
          return web3;
        } catch (error) {
          console.error(error);
        }
      } else if (window.web3) {
        const web3 = new Web3(window.web3.currentProvider);
        setWeb3(web3);
        return web3;
      } else {
        console.error("No Web3 provider detected");
      }
    };

    const initContract = async () => {
      const web3 = await initWeb3();
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = InsuranceContract.networks[networkId];
      const contract = new web3.eth.Contract(
        InsuranceContract.abi,
        deployedNetwork && deployedNetwork.address
      );
      setInsuranceContract(contract);
    };

    initContract();
  }, []);

  useEffect(() => {
    const loadAccounts = async () => {
      const web3 = await web3;
      const accounts = await web3.eth.getAccounts();
      setAccounts(accounts);
    };

    if (web3) {
      loadAccounts();
    }
  }, [web3]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const web3 = await web3;
    const account = accounts[selectedAccountIndex];

    const policyAmountInWei = web3.utils.toWei(policyAmount, "ether");
    const premiumInWei = web3.utils.toWei(premium, "ether");

    await insuranceContract.methods
      .createIns(
        account,
        account,
        account,
        policyAmountInWei,
        premiumInWei,
        startDate,
        endDate
      )
      .send({ from: account });
  };

  const handleMakeClaim = async () => {
    const web3 = await web3;
    const account = accounts[selectedAccountIndex];

    const claimAmtInWei = web3.utils.toWei(claimAmt, "ether");

    await insuranceContract.methods
      .makeClaim(claimAmtInWei)
      .send({ from: account });
  };

  const handleRecordProcedure = async () => {
    const web3 = await web3;
    const account = accounts[selectedAccountIndex];

    const timestamp = Math.floor(new Date(procedureTimestamp) / 1000);

    await insuranceContract.methods
      .recordProcedure(procedureName, timestamp)
      .send({ from: account });
  };

  const handleAcceptClaim = async () => {
    const web3 = await web3;
    const account = accounts[selectedAccountIndex];

    await insuranceContract.methods.acceptClaim().send({ from: account });
  };

  const handleRejectClaim = async () => {
    const web3 = await web3;
    const account = accounts[selectedAccountIndex];
    await insuranceContract.methods.rejectClaim().send({ from: account });
  };

  const handleAccountChange = (event) => {
    const newIndex = parseInt(event.target.value);
    setSelectedAccountIndex(newIndex);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Insurance Contract</h1>
        <select value={selectedAccountIndex} onChange={handleAccountChange}>
          {accounts.map((account, index) => (
            <option key={account} value={index}>
              {account}
            </option>
          ))}
        </select>
      </header>
      <form onSubmit={handleSubmit}>
        <h2>Create Policy</h2>
        <label>
          Policy Amount (in ether):
          <input
            type="number"
            value={policyAmount}
            onChange={(event) => setPolicyAmount(event.target.value)}
          />
        </label>
        <br />
        <label>
          Premium (in ether):
          <input
            type="number"
            value={premium}
            onChange={(event) => setPremium(event.target.value)}
          />
        </label>
        <br />
        <label>
          Start Date:
          <input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
        </label>
        <br />
        <label>
          End Date:
          <input
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </label>
        <br />
        <button type="submit">Create Policy</button>
      </form>
      <br />
      <form>
        <h2>Make a Claim</h2>
        <label>
          Claim Amount (in ether):
          <input
            type="number"
            value={claimAmt}
            onChange={(event) => setClaimAmt(event.target.value)}
          />
        </label>
        <br />
        <button type="button" onClick={handleMakeClaim}>
          Make Claim
        </button>
        <button type="button" onClick={handleAcceptClaim}>
          Accept Claim
        </button>
        <button type="button" onClick={handleRejectClaim}>
          Reject Claim
        </button>
      </form>
      <br />
      <form>
        <h2>Record Procedure</h2>
        <label>
          Procedure Name:
          <input
            type="text"
            value={procedureName}
            onChange={(event) => setProcedureName(event.target.value)}
          />
        </label>
        <br />
        <label>
          Procedure Timestamp:
          <input
            type="datetime-local"
            value={procedureTimestamp}
            onChange={(event) => setProcedureTimestamp(event.target.value)}
          />
        </label>
        <br />
        <button type="button" onClick={handleRecordProcedure}>
          Record Procedure
        </button>
      </form>
    </div>
  );
};

export default App;
