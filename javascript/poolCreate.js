//Metamask sending trasactions:
//https://docs.metamask.io/guide/sending-transactions.html#transaction-parameters

detectMetamaskInstalled() //When the page is opened check for error handling issues.

let accounts = []; ////Empty array to be filled once Metamask is called.
document.getElementById("enableEthereumButton").innerHTML =  "Connect Metamask 🦊"
document.getElementById("getAllPairsLength").innerHTML =  "Loading..."
document.getElementById("getAllPairsIndexZero").innerHTML =  "Loading..."

const baseSepoliaChainId = 20994;

const provider = new ethers.providers.Web3Provider(window.ethereum); //Imported ethers from index.html with "<script src="https://cdn.ethers.io/lib/ethers-5.6.umd.min.js" type="text/javascript"></script>".

// const signer = provider.getSigner(); //Do this when the user clicks "enableEthereumButton" which will call getAccount() to get the signer private key for the provider.  
 
const contractAddress_JS = '0xCcc41c8E5BeE781FAe36Af0a801C1eA523067c6F'
const contractABI_JS = [{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"allPairs","outputs":[{"internalType":"address","name":"pair","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"allPairsLength","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"}],"name":"createPair","outputs":[{"internalType":"address","name":"pair","type":"address"}],"stateMutability":"nonpayable","type":"function"}]

const contractDefined_JS = new ethers.Contract(contractAddress_JS, contractABI_JS, provider);

// const contractDefined_JS = new ethers.Contract(contractAddress_JS, contractABI_JS, signer);


getDataOnChainToLoad()

async function getDataOnChainToLoad(){
  let chainIdConnected = await getChainIdConnected();

  if(chainIdConnected == baseSepoliaChainId){
    getStoredData()
  }
  if(chainIdConnected != baseSepoliaChainId){
    document.getElementById("getAllPairsLength").innerHTML =  "Install Metamask and select Base Sepolia Testnet to have a Web3 provider to read blockchain data."
    document.getElementById("getAllPairsIndexZero").innerHTML =  "Install Metamask and select Base Sepolia Testnet to have a Web3 provider to read blockchain data."
  }
  
}

async function getStoredData() {
  let getAllPairsLengthValue = await contractDefined_JS.allPairsLength()
  if(getAllPairsLengthValue === undefined){
    document.getElementById("getAllPairsLength").innerHTML =  "Install Metamask and select Sepolia Testnet to have a Web3 provider to read blockchain data."
  }
  else{
    document.getElementById("getAllPairsLength").innerHTML =  getAllPairsLengthValue
  }
  let getPairIndexZeroAddress = await contractDefined_JS.allPairs(0)
  if(getPairIndexZeroAddress === undefined){
    document.getElementById("getAllPairsIndexZero").innerHTML =  "Install Metamask and select Sepolia Testnet to have a Web3 provider to read blockchain data."
  }
  else{
    document.getElementById("getAllPairsIndexZero").innerHTML =  getPairIndexZeroAddress
  }
}

async function sentTxAsync(addressTokenA,addressTokenB) {

  const callDataObject = await contractDefined_JS.populateTransaction.createPair(addressTokenA,addressTokenB);
  const txData = callDataObject.data;

  ethereum
  .request({
    method: 'eth_sendTransaction',
    params: [
      {
        from: accounts[0],
        to: contractAddress_JS,
        data: txData
      },
    ],
  })
  .then((txHash) => console.log(txHash))
  .catch((error) => console.error);  
    
}

// contractDefined_JS.on("setEvent", () => {

//   getStoredData()

// });

//Connect to Metamask.
const ethereumButton = document.querySelector('#enableEthereumButton');
ethereumButton.addEventListener('click', () => {
    detectMetamaskInstalled()
    enableMetamaskOnSepolia()
});

// MODIFY CONTRACT STATE WITH SET FUNCTION WITH PREDEFINED DATA FROM WEB3.JS
const changeStateInContractEvent = document.querySelector('.changeStateInContractEvent');
changeStateInContractEvent.addEventListener('click', () => {
  checkAddressMissingMetamask()
  
  var valueAddressTokenA = document.getElementById("addressTokenA").value.toString();
  var valueAddressTokenB = document.getElementById("addressTokenB").value.toString();

  sentTxAsync(valueAddressTokenA,valueAddressTokenB)

})

//If Metamask is not detected the user will be told to install Metamask.
function detectMetamaskInstalled(){
  try{
     ethereum.isMetaMask
  }
  catch(missingMetamask) {
     alert("Metamask not detected in browser! Install Metamask browser extension, then refresh page!")
     document.getElementById("getAllPairsLength").innerHTML =  "Install Metamask and select Sepolia Testnet to have a Web3 provider to read blockchain data."
     document.getElementById("getAllPairsIndexZero").innerHTML =  "Install Metamask and select Base Sepolia Testnet to have a Web3 provider to read blockchain data."
  }

}

//Alert user to connect their Metamask address to the site before doing any transactions.
function checkAddressMissingMetamask() {
  if(accounts.length == 0) {
    alert("No address from Metamask found. Click the top button to connect your Metamask account then try again without refreshing the page.")
  }
}

async function getChainIdConnected() {

  const connectedNetworkObject = await provider.getNetwork();
  const chainIdConnected = connectedNetworkObject.chainId;
  return chainIdConnected

}

async function getAccount() {
  accounts = await ethereum.request({ method: 'eth_requestAccounts' });
  const signer = provider.getSigner();
  document.getElementById("enableEthereumButton").innerText = accounts[0].substr(0,5) + "..." +  accounts[0].substr(38,4)  
}

async function enableMetamaskOnSepolia() {
  //Get account details from Metamask wallet.
  getAccount();

  // Updated chainId request method suggested by Metamask.
  let chainIdConnected = await window.ethereum.request({method: 'net_version'});

  // // Outdated chainId request method which might get deprecated:
  // //  https://github.com/MetaMask/metamask-improvement-proposals/discussions/23
  // let chainIdConnected = window.ethereum.networkVersion;

  console.log("chainIdConnected: " + chainIdConnected)

  //Check if user is on the Sepolia testnet. If not, alert them to change to Sepolia.
  if(chainIdConnected != baseSepoliaChainId){
    // alert("You are not on the Sepolia Testnet! Please switch to Sepolia and refresh page.")
    try{
      await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{
             chainId: "0x" + baseSepoliaChainId.toString(16) //Convert decimal to hex string.
          }]
        })
      location.reload(); 
      // alert("Failed to add the network at chainId " + baseSepoliaChainId + " with wallet_addEthereumChain request. Add the network with https://chainlist.org/ or do it manually. Error log: " + error.message)
    } catch (error) {
      alert("Failed to add the network at chainId " + baseSepoliaChainId + " with wallet_addEthereumChain request. Add the network with https://chainlist.org/ or do it manually. Error log: " + error.message)
    }
  }
}