import { Wallet, RESTClient, RawKey, Msg, MsgExecute, bcs, MsgWithdrawDelegatorReward } from "@initia/initia.js";
import { type AssetMetadata, type Pair, type PairName, type Validator, ASSET_METADATA, getPair, getPairDisplayName, VALIDATOR } from "./constants";

export const createWallet = (privateKey: `0x${string}`) => {
    if (!privateKey.startsWith("0x")) {
        throw new Error("PRIVATE_KEY must start with 0x");
    }
    if (privateKey.length !== 66) {
        throw new Error("PRIVATE_KEY must be 66 characters long");
    }

    const key = new RawKey(Buffer.from(privateKey.slice(2), "hex"), true);

    const restClient = new RESTClient("https://rest.initia.xyz", {
        chainId: "interwoven-1",
        gasPrices: `0.15uinit`,
        gasAdjustment: "1.75",
    });

    const wallet = new Wallet(restClient, key);
    return wallet;
};

export const signAndBroadcast = async (wallet: Wallet, msg: Msg) => {
    const tx = await wallet.createAndSignTx({
        msgs: [msg],
    });
    const res = await wallet.rest.tx.broadcast(tx);
    return res;
};

export const getBalance = async (wallet: Wallet, address: string) => {
    const balance = await wallet.rest.bank.balance(address);
    return balance;
};

export const singleAssetProvideStake = async (
    wallet: Wallet,
    params: {
        pair: Pair;
        offerAssetMetadata: AssetMetadata;
        amountIn: number; // already in uinit
        validator: Validator;
    },
    slippage = 0.005,
) => {
    const { pair, offerAssetMetadata, amountIn, validator } = params;

    const estimationView = await wallet.rest.move.view(
        "0xb845fba0d0072c282f6284465933c4b32b1a0d4071604935a7a8d999c85d01fb",
        "dex_utils",
        "single_asset_provide_liquidity_cal",
        [],
        [
            // just making prettier skip this array lol
            bcs.address().serialize(pair).toBase64(),
            bcs.address().serialize(offerAssetMetadata).toBase64(),
            bcs.u64().serialize(amountIn).toBase64(),
        ],
    );

    const estimatedLiquidity = Number(JSON.parse(estimationView.data)[0]);
    const minLiquidity = Math.floor(estimatedLiquidity * (1 - slippage));

    const msg = new MsgExecute(
        wallet.key.accAddress,
        "0xb845fba0d0072c282f6284465933c4b32b1a0d4071604935a7a8d999c85d01fb",
        "dex_utils",
        "single_asset_provide_stake",
        [],
        [
            bcs.address().serialize(pair).toBase64(),
            bcs.address().serialize(offerAssetMetadata).toBase64(),
            bcs.u64().serialize(Math.floor(amountIn)).toBase64(),
            bcs.option(bcs.u64()).serialize(minLiquidity).toBase64(),
            bcs.string().serialize(validator).toBase64(),
        ],
    );

    const res = await signAndBroadcast(wallet, msg);
    return res;
};

export const withdrawReward = async (wallet: Wallet, validator: Validator) => {
    const msg = new MsgWithdrawDelegatorReward(wallet.key.accAddress, validator);

    const res = await signAndBroadcast(wallet, msg);
    return res;
};

export const getRewards = async (wallet: Wallet) => {
    const res = await wallet.rest.distribution.rewards(wallet.key.accAddress);
    const rewards = Object.entries(res.rewards)
        .map(([validator, details]) =>
            details.map((r) => {
                const reward = r.coins.get("uinit")?.amount ?? "0";
                return { ...r, reward, validator, pairName: getPairDisplayName(r.denom as `move/${string}`), pair: getPair(r.denom as `move/${string}`) };
            }),
        )
        .flat();
    return rewards;
};

export const compoundUsdcInitLpProcedure = async (wallet: Wallet) => {
    const allRewards = await getRewards(wallet);
    const rewards = allRewards
        .filter((r) => r.pair !== null)
        .filter((r) => r.pairName !== null)
        .filter((r) => Object.values(VALIDATOR).includes(r.validator as Validator))
        .map((r) => ({
            ...r,
            reward: parseInt(r.reward),
        }))
        .filter((r) => r.reward > 0) as {
        reward: number;
        validator: Validator;
        pairName: PairName;
        pair: Pair;
    }[];
    for (const reward of rewards) {
        await claimStake(wallet, {
            pair: reward.pair,
            offerAssetMetadata: ASSET_METADATA.INIT,
            amountIn: reward.reward,
            validator: reward.validator,
        });
    }
};

export const claimStake = async (wallet: Wallet, params: { pair: Pair; offerAssetMetadata: AssetMetadata; amountIn: number; validator: Validator }) => {
    const { pair, offerAssetMetadata, amountIn, validator } = params;
    const { txhash: withdrawRewardTxHash } = await withdrawReward(wallet, validator);
    console.log(`withdrawReward TX: https://scan.initia.xyz/interwoven-1/txs/${withdrawRewardTxHash}`);

    const staked = await singleAssetProvideStake(wallet, {
        pair,
        offerAssetMetadata,
        amountIn,
        validator,
    });
    console.log(`singleAssetProvideStake TX: https://scan.initia.xyz/interwoven-1/txs/${staked.txhash}`);
    return staked;
};
