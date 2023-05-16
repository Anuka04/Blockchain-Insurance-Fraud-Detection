import React, { useState, useEffect } from "react";
import Insurance from "../../contracts/Insurance.json";
import Web3 from "web3";
import "./Home.css";

const Home = () => {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState(null);
  const [insuranceCompany, setInsuranceCompany] = useState("");
  const [user, setUser] = useState("");
  const [hospital, setHospital] = useState("");
  const [policyAmount, setPolicyAmount] = useState(0);
  const [premium, setPremium] = useState(0);
  const [startDate, setStartDate] = useState(0);
  const [endDate, setEndDate] = useState(0);
  const [procedures, setProcedures] = useState([]);
  const [procedureName, setProcedureName] = useState("");
  const [procedureTimestamp, setProcedureTimestamp] = useState(0);
  const [claimAmt, setClaimAmt] = useState(0);
  const [claimStatus, setClaimStatus] = useState("");

  useEffect(() => {
    const initWeb3 = async () => {
      try {
        const ganacheProvider = new Web3.providers.HttpProvider(
          "http://127.0.0.1:7545"
        );
        const web3 = new Web3(ganacheProvider);
        setWeb3(web3);
      } catch (error) {
        console.log(error);
      }
    };
    initWeb3();
  }, []);

  useEffect(() => {
    const getAccounts = async () => {
      if (web3) {
        const accounts = await web3.eth.getAccounts();
        setAccounts(accounts);
      }
    };
    getAccounts();
  }, [web3]);

  useEffect(() => {
    const getContract = async () => {
      if (web3) {
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = Insurance.networks[networkId];
        const contract = new web3.eth.Contract(
          Insurance.abi,
          deployedNetwork && deployedNetwork.address
        );
        setContract(contract);
      }
    };
    getContract();
  }, [web3]);

  const handleCreatePolicy = async (event) => {
    event.preventDefault();
    try {
      await contract.methods
        .createIns(
          user,
          insuranceCompany,
          hospital,
          policyAmount,
          premium,
          startDate,
          endDate
        )
        .send({ from: accounts[0] });
      alert("Policy created successfully!");
    } catch (error) {
      alert(`${accounts[0]} Failed to create policy: ${error}`);
    }
  };

  const handleRecordProcedure = async (event) => {
    event.preventDefault();
    try {
      await contract.methods
        .recordProcedure(procedureName, procedureTimestamp)
        .send({ from: "0x410b4dae16798555f9DBE24206ae795B0ce019Af" }); //given the account as 2s
      alert("Procedure recorded successfully!");
      setProcedures(await contract.methods.getProcedures().call());
    } catch (error) {
      // alert(
      //   `Your account number is ${accounts[2]} | Failed to create procedure: ${error}`
      // );
    }
  };

  const handleClaim = async (event) => {
    event.preventDefault();
    try {
      await contract.methods.makeClaim(claimAmt).send({ from: accounts[0] });
      await contract.methods.claim().send({ from: accounts[0] });
      alert("Claim submitted successfully!");
    } catch (error) {
      alert(`Your account number is ${accounts[0]} : ${error}`);
    }
  };

  const handleVerifyClaim = async (accepted) => {
    try {
      if (accepted) {
        await contract.methods.acceptClaim().send({ from: accounts[1] });
        setClaimStatus("Claim accepted!");
        alert(`Claim accepted!`);
      } else {
        await contract.methods.rejectClaim().send({ from: accounts[1] });
        setClaimStatus("Claim rejected!");
        alert(`Claim rejected!`);
      }
    } catch (error) {
      alert(`Account: ${accounts[1]} Failed to create claim: ${error}`);
    }
  };

  const handleGetStatus = async () => {
    try {
      const status = await contract.methods.getStatus().call();
      alert(`Policy status: ${status}`);
    } catch (error) {
      // alert(`Failed det status: ${error}`);
    }
  };

  const fetchProcedures = async () => {
    if (contract) {
      const procList = await contract.methods.getProcedures().call();
      setProcedures(procList);
    }
  };

  useEffect(() => {
    fetchProcedures();
  }, [contract]);

  return (
    <div className="App">
      <h1>Insurance App</h1>
      <div>
        <p>User account: {accounts[0]}</p>
        <hr />
        <h2>Create Policy</h2>
        <form onSubmit={handleCreatePolicy}>
          <br />
          <label>
            User:
            <input
              type="text"
              value={user}
              onChange={(e) => setUser(e.target.value)}
            />
          </label>
          <br />
          <label>
            Insurance Company:
            <input
              type="text"
              value={insuranceCompany}
              onChange={(e) => setInsuranceCompany(e.target.value)}
            />
          </label>
          <br />
          <label>
            Hospital:
            <input
              type="text"
              value={hospital}
              onChange={(e) => setHospital(e.target.value)}
            />
          </label>
          <br />
          <label>
            Policy Amount:
            <input
              type="number"
              value={policyAmount}
              onChange={(e) => setPolicyAmount(e.target.value)}
            />
          </label>
          <br />
          <label>
            Premium:
            <input
              type="number"
              value={premium}
              onChange={(e) => setPremium(e.target.value)}
            />
          </label>
          <br />
          <label>
            Start Date:
            <input
              type="number"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>
          <br />
          <label>
            End Date:
            <input
              type="number"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </label>
          <br />
          <button type="submit">Create Policy</button>
        </form>
        <br />
        <h2>Print Policy</h2>
        <p>Policy Amount: {policyAmount}</p>
        <p>Premium: {premium}</p>
        {/* <p>Start Date: {new Date(startDate * 1000).toLocaleDateString()}</p> */}
        <p>Start Date: {startDate}</p>
        <p>End Date: {endDate}</p>
        <hr />
        <h2>Record Procedure</h2>
        <form onSubmit={handleRecordProcedure}>
          <label>
            Procedure Name:
            <input
              type="text"
              value={procedureName}
              onChange={(e) => setProcedureName(e.target.value)}
            />
          </label>
          <br />
          <label>
            Timestamp:
            <input
              type="number"
              value={procedureTimestamp}
              onChange={(e) => setProcedureTimestamp(e.target.value)}
            />
          </label>
          <br />
          <button type="submit">Record Procedure</button>
        </form>
        <br />
        <div>
          <h2>Display procedures</h2>
          <div>
            <p>Name: {procedureName}</p>
            <p>Timestamp: {procedureTimestamp}</p>
          </div>
        </div>
        <br />
        <hr />
        <h2>Make Claim</h2>
        <form onSubmit={handleClaim}>
          <label>
            Claim Amount:
            <input
              type="number"
              value={claimAmt}
              onChange={(e) => setClaimAmt(e.target.value)}
            />
          </label>
          <button type="submit">Make Claim</button>
        </form>
        <hr />
        <h2>Verify Claim</h2>
        <button onClick={() => handleVerifyClaim(true)}>Accept Claim</button>
        <button onClick={() => handleVerifyClaim(false)}>Reject Claim</button>
        <br />
        <hr />
        <h2>Get Policy Status</h2>
        <button onClick={handleGetStatus}>Get Policy Status</button>
        <p>{claimStatus}</p>
      </div>
    </div>
  );
};
export default Home;
