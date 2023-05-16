// //SPDX-License-Identifier: MIT

// pragma solidity >=0.5.0;

// contract Counter {
//     uint public count;

//     function get() public view returns (uint) {
//         return count;
//     }

//     function inc() public {
//         count += 1;
//     }

//     function dec() public {
//         count -= 1;
//     }
// }

import { useEffect, useState } from "react";
import Web3 from "web3";
import Counter from "../../contracts/Counter.json";

export default function Customer() {
  const [count, setCount] = useState(0);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        const ganacheProvider = new Web3.providers.HttpProvider(
          "http://127.0.0.1:7545"
        );
        const web3Instance = new Web3(ganacheProvider);

        const chainId = await web3Instance.eth.getChainId();
        console.log("Chain ID: ", chainId);

        const accounts = await web3Instance.eth.getAccounts();
        console.log("Accounts: ", accounts);
        setAccount(accounts[0]);

        const networkID = await web3Instance.eth.net.getId();
        const deployedNetwork = Counter.networks[networkID];
        const counterContract = new web3Instance.eth.Contract(
          Counter.abi,
          deployedNetwork && deployedNetwork.address
        );
        setContract(counterContract);
      } catch (error) {
        console.log(error);
      }
    };
    init();
  }, []);

  const handleIncrement = async () => {
    try {
      await contract.methods.inc().send({ from: account });
      const newCount = await contract.methods.get().call();
      setCount(newCount);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDecrement = async () => {
    try {
      await contract.methods.dec().send({ from: account });
      const newCount = await contract.methods.get().call();
      setCount(newCount);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <h1>Counter:{count}</h1>
      <button onClick={handleIncrement}>Inc</button>
      <button onClick={handleDecrement}>Dec</button>
    </div>
  );
}
