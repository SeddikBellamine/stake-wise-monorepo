import Web3 from 'web3';

const getWeb3 = async () => {
  const provider = (window as any).ethereum;
  if (!provider) {
    throw new Error('No Web3 provider found. Please install MetaMask.');
  }

  await provider.request({ method: 'eth_requestAccounts' });
  const web3 = new Web3(provider);
  return web3;
};

export default getWeb3;
