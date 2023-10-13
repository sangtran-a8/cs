import { expect } from 'chai'
import { Leaf, MerkleDistribution, Tree } from '../dist'
import { InfuraProvider, Wallet } from 'ethers'
import 'dotenv/config'

describe('sdk', function () {
  async function deployFixture() {
    const wallet = new Wallet(
      process.env.PRIVKEY || '',
      new InfuraProvider('sepolia', '3a3c7d470c4b4d2c8e794139ef79f0d7'),
    )
    // Tree
    const leaves: Leaf[] = Array.from(Array(4).keys()).map(
      (i) =>
        new Leaf(wallet.address, BigInt(i + 1) * 1_000_000_000_000_000_000n),
    )
    const tree = new Tree(leaves)
    // MerkleDistribution
    const contract = new MerkleDistribution({ tree, wallet })
    // Return
    return { contract, wallet }
  }

  it('token', async function () {
    const { contract } = await deployFixture()
    const tokenAddress = await contract.token()
    expect(tokenAddress).equal('0x078E68C643a8FF417b19eaa75E252592725C6fE0')
  })

  it('fund & claim via sdk', async function () {
    const { contract, wallet } = await deployFixture()
    // Verify
    const verified = await contract.verify(wallet.address)
    expect(verified).to.be.true
    // Claim
    const re = await contract.claim(wallet.address)
    console.log(re)
  })
})
