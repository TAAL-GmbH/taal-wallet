export const networkList = [
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
] as const;

export const networkMap = networkList.reduce((acc, network) => {
  acc[network.id] = network;
  return acc;
}, {} as Record<typeof networkList[number]["id"], typeof networkList[number]>);
