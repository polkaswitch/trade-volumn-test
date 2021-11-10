#!/usr/bin/env node
// Temporary demo client
// Works both in browser and node.js

require('dotenv').config()
const fs = require('fs')
const axios = require('axios')
const Web3 = require('web3')
const abiDecoder = require('abi-decoder')
const { toWei, fromWei, toBN, BN } = require('web3-utils')

let web3, contract, contractAddress;

async function checkEvent() {
  // Get all events from smart contract
  console.log('Getting current state from contract')
  const events = await contract.getPastEvents('allEvents', {fromBlock: 21182590})
  console.log('Events', events);
}

async function getTxs() {
  let currentBlockNum = 0;
  // currentBlockNum = await web3.eth.getBlockNumber();
  currentBlockNum = 21217033;
  console.log(`Start time`, Date.now());
  console.log(`Current Block number`, currentBlockNum);

  for (let num = currentBlockNum; num > currentBlockNum - 1; num--) {
    const block = await web3.eth.getBlock(num, true);
    const transactions = block.transactions;

    for(let j = 0; j < transactions.length; j++) {
      const tx = transactions[j]
      // Get txs from contract address
      if ((tx.to.toLowerCase() === contractAddress.toLowerCase()) && tx.input){

        const decodedData = abiDecoder.decodeMethod(tx.input);
        if ((typeof decodedData !== 'undefined') && decodedData['name'] === 'swap' ) {
          let fromTokenAddress = null
          let amount = 0
          if (decodedData['params'][0]['name'] === 'fromToken') {
            fromTokenAddress = decodedData['params'][0]['value']
          }
          if (decodedData['params'][2]['name'] === 'amount') {
            amount = decodedData['params'][2]['value']
          }

          console.log('fromTokenAddress - ', fromTokenAddress)
          console.log('amount - ', amount)
          console.log('timestamp - ', block.timestamp)
        }
      }
    }
  }

  console.log(`End time`, Date.now());
}

async function init() {
  let abi
  contractAddress = '0xB9E1505be481FC3fb8E87E92554E45FE6FbcFB7e'
  abi = require('./abis/polygon.json');
  abiDecoder.addABI(abi);
  web3 = new Web3('https://rpc-mainnet.maticvigil.com', null, { transactionConfirmationBlocks: 1 });
  contract = new web3.eth.Contract(abi, contractAddress);
  await getTxs();
}

async function main() {
  await init()
}

main()
