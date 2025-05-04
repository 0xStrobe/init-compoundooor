process.noDeprecation = true;

import { compoundUsdcInitLpProcedure, createWallet } from "./src/lib";

const args = process.argv.slice(2);
const privateKeyFromArgs = args[0] as `0x${string}`;
const privateKeyFromEnv = process.env.PRIVATE_KEY as `0x${string}`;

const PRIVATE_KEY = privateKeyFromArgs ?? privateKeyFromEnv;

if (!PRIVATE_KEY) {
    console.error("Private key is required");
    console.error("Usage:");
    console.error("    $ ./compound 0x...");
    console.error("  or when the private key is in the env:");
    console.error("    $ PRIVATE_KEY=0x... ./compound");
    process.exit(1);
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const main = async () => {
    const wallet = createWallet(PRIVATE_KEY);
    console.log(`Using wallet: ${wallet.key.accAddress}`);

    while (true) {
        try {
            await compoundUsdcInitLpProcedure(wallet);
            console.log(`Compounded and waiting for 1 hour...`);
            await sleep(3600_000);
        } catch (e) {
            console.error(e);
            console.log(`Retrying in 1 minute...`);
            await sleep(60_000);
        }
    }
};

main();
