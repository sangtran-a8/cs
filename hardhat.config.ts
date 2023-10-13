import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import 'hardhat-abi-exporter'
import { Wallet } from 'ethers'
import 'dotenv/config'

const config: HardhatUserConfig = {
  solidity: '0.8.19',
  abiExporter: {
    path: './abi',
    runOnCompile: true,
    clear: true,
    flat: true,
    only: [':MerkleDistribution$'],
  },
  networks: {
    sepolia: {
      url: 'https://sepolia.infura.io/v3/3a3c7d470c4b4d2c8e794139ef79f0d7',
      accounts: [process.env.PRIVKEY || Wallet.createRandom().privateKey],
    },
  },
}

export default config
