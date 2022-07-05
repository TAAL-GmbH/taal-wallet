export const networkList = [
  {
    id: 'taalnet',
    label: 'Taalnet',
    envName: 'testnet',
    wocNetwork: 'taalnet',
  },
  {
    id: 'testnet',
    label: 'Testnet',
    envName: 'testnet',
    wocNetwork: 'test',
  },
  {
    id: 'mainnet',
    label: 'Mainnet',
    envName: 'mainnet',
    wocNetwork: 'main',
  },
];

export const networkMap = networkList.reduce((acc, network) => {
  acc[network.id] = network;
  return acc;
}, {} as { [id: string]: typeof networkList[0] });
