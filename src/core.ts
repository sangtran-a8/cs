import { Contract, ContractRunner } from 'ethers'

import { Tree } from './tree'
import abi from '../abi/MerkleDistribution.json'

/**
 * Merkle distribution
 */
export class MerkleDistribution {
  public readonly tree: Tree
  public readonly contract: Contract

  /**
   * Constructor
   * @param opts.tree Merkle tree
   * @param opts.wallet Merkle wallet
   * @param opts.contractAddress (Optional) Contract address
   */
  constructor({
    tree,
    wallet,
    contractAddress = '0x40F057899235da0372c94D7c45Df57fB20CD0C71',
  }: {
    tree: Tree
    wallet: ContractRunner
    contractAddress?: string
  }) {
    this.tree = tree
    this.contract = new Contract(contractAddress, abi, wallet)
  }

  /**
   * Get the airdropped ERC20 token address
   * @returns Token address
   */
  async token(): Promise<string> {
    const address = await this.contract.token()
    return address
  }

  /**
   * Verify receiver address
   * @param address Wallet address
   * @returns true/false
   */
  async verify(address: string): Promise<boolean> {
    const leaf = this.tree.leaves.find((leaf) => leaf.address === address)
    if (!leaf) return false
    const proof = this.tree.prove(leaf)
    const verified = this.tree.verify(leaf, proof)
    if (!verified) return false
    const claimed = await this.contract.claimed(address)
    if (claimed) return false
    return true
  }

  /**
   * Claim my tokens
   * @param address Wallet address
   */
  async claim(address: string) {
    const leaf = this.tree.leaves.find((leaf) => leaf.address === address)
    if (!leaf) throw new Error('Invalid receiver')
    const proof = this.tree.prove(leaf)
    await this.contract.claim(
      leaf.amount,
      proof.map((e) => e.value),
    )
  }
}
