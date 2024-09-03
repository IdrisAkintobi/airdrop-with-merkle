import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { parse } from "csv-parse";
import { parseUnits } from "ethers";
import { createReadStream } from "node:fs";
import { resolve } from "node:path";

const filePath: string = resolve("data", "records.csv");
type RecordType = { address: string; amount: string };

export async function generateMerkleTree(): Promise<
  StandardMerkleTree<(string | bigint)[]>
> {
  const parser = parse({ columns: true }) as unknown as NodeJS.ReadWriteStream;
  const records: RecordType[] = [];

  return new Promise((resolve, reject) => {
    parser.on("readable", () => {
      let record: string | Buffer;
      while ((record = parser.read())) {
        records.push(record as unknown as RecordType);
      }
    });

    parser.on("error", (err) => {
      console.error(`Error parsing file ${filePath}`);
      reject(err);
    });

    parser.on("end", () => {
      console.info(`Finished parsing file ${filePath}`);

      const parsedRecords = records.map((i) => [
        i.address,
        parseUnits(i.amount, 18),
      ]);

      const tree = StandardMerkleTree.of(parsedRecords, ["address", "uint256"]);
      resolve(tree);
    });

    const fileStream = createReadStream(filePath);
    fileStream.pipe(parser);
  });
}

// Usage example
generateMerkleTree()
  .then((tree) => {
    console.info("Merkle Tree Root:", tree.root);
  })
  .catch((error) => {
    console.error("Error generating Merkle Tree Root:", error);
  });
