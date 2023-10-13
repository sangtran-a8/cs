import { Leaf } from './leaf'
import { Node } from './node'

/**
 * The merkle. By the tree, people can generate the proof and locally verify the proof.
 */
export class Tree {
  /**
   * The list of leaves.
   */
  public readonly leaves

  /**
   * Tree constructor.
   * @param leaves The list of <address,amount> represented as leaves.
   */
  constructor(leaves: Leaf[]) {
    this.leaves = leaves.sort((a, b) => a.gte(b))
  }

  /**
   * The merkle root.
   */
  get root(): Node {
    let nodes = this.leaves.map((leaf) => new Node(leaf.value))

    if (nodes.length === 0)
      throw new Error('Cannot generate merkle root from empty tree.')

    if (nodes.length === 1) return nodes[0]

    while (nodes.length > 1) {
      const temp: Node[] = []
      for (let i = 0; i < nodes.length; i += 2) {
        if (!nodes[i + 1]) {
          temp.push(nodes[i])
          break
        }
        temp.push(nodes[i].hash(nodes[i + 1]))
      }
      nodes = temp
    }
    return nodes[0]
  }

  /**
   * Generate the proof.
   * @param leaf Leaf.
   * @returns Proof - The list of nodes.
   */
  prove(leaf: Leaf): Node[] {
    let proof: Node[] = []
    let nodes = this.leaves.map((leaf) => new Node(leaf.value))
    let nodeProved = new Node(leaf.value)
    const merkleTreeLevel = Math.ceil(Math.log2(nodes.length))

    /* Pre-validate */
    if (nodes.length === 0)
      throw new Error('Cannot find prove from empty tree!')
    if (nodes.length === 1) return proof

    /* Generate proof */
    let sibling: Node | undefined = undefined

    for (let i = 0; i < merkleTreeLevel; i++) {
      //Step 1: find index of nodeProved
      let provedIdx = nodes.findIndex((node) => node.eq(nodeProved))

      //Step 2: find sibling
      if (provedIdx % 2 === 0 && provedIdx + 1 < nodes.length) {
        sibling = nodes[provedIdx + 1]
      } else {
        sibling = nodes[provedIdx - 1]
      }

      //Step 3: update nodeProved and proof
      if (sibling) {
        nodeProved = nodeProved.hash(sibling)
        proof.push(sibling)
      }

      //Step 4: build next level of nodes
      const nextLevel: Node[] = []
      for (let i = 0; i < nodes.length; i += 2) {
        if (i + 1 < nodes.length) nextLevel.push(nodes[i].hash(nodes[i + 1]))
        else nextLevel.push(nodes[i])
      }
      nodes = nextLevel
    }

    return proof
  }

  /**
   * Verify the proof.
   * @param leaf The receiver info represented as a leaf.
   * @param proof The proof to the leaf.
   * @returns true/false
   */
  verify(leaf: Leaf, proof: Node[]): boolean {
    let node = new Node(leaf.value)
    for (let i = 0; i < proof.length; i++) node = node.hash(proof[i])
    return this.root.eq(node)
  }
}
