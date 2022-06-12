import { VoteAccountInfo, ValidatorInfo, PublicKey } from "@solana/web3.js";
import { sleep } from "./sleep";
import { ValidatorApy } from "./stakeviewApp";
import { toPublicKey } from "./to-publickey";
import { ValidatorScore } from "./validatorsApp";
export interface ValidatorMeta {
  voteAccountInfo: VoteAccountInfo;
  validatorInfo: ValidatorInfo | undefined;
  validatorScore: ValidatorScore | undefined;
  validatorApy: ValidatorApy | undefined;
}
const BATCH_SIZE = 100;

export async function validatorBatcher(
  voteAccountStatus: VoteAccountInfo[],
  validatorInfos: ValidatorInfo[],
  validatorScores: ValidatorScore[],
  validatorApys: ValidatorApy[],
  onValidatorMetas: (metas: ValidatorMeta[]) => void,
  abortSignal: AbortSignal
) {
  let validatorMetas: ValidatorMeta[] = [];
  let remainingVoteAccountInfos = [...voteAccountStatus];
  let remainingValidatorInfos = [...validatorInfos];
  let remainingValidatorApys = [...validatorApys];

  console.log("scores", validatorScores.length);

  for (let i = 0; i < validatorScores.length; i++) {
    const validatorScore = validatorScores[i];
    const voteAccountIndex = remainingVoteAccountInfos.findIndex(
      (info) => info.nodePubkey === validatorScore.account
    );
    if (voteAccountIndex < 0) {
      // If score does not match anything then it goes into the no score bucket
      continue;
    }
    const [voteAccountInfo] = remainingVoteAccountInfos.splice(
      voteAccountIndex,
      1
    );

    const validatorInfoIndex = remainingValidatorInfos.findIndex(
      (validatorInfo) =>
        validatorInfo.key.equals(toPublicKey(voteAccountInfo.nodePubkey))
    );
    let validatorInfo: ValidatorInfo | undefined;
    [validatorInfo] =
      validatorInfoIndex > -1
        ? remainingValidatorInfos.splice(validatorInfoIndex, 1)
        : [];

    const validatorApyIndex = remainingValidatorApys.findIndex(
      (validatorApy) => validatorApy.id === voteAccountInfo.nodePubkey
    );
    let validatorApy: ValidatorApy | undefined;
    [validatorApy] =
      validatorApyIndex > -1
        ? remainingValidatorApys.splice(validatorApyIndex, 1)
        : [];

    validatorMetas.push({
      voteAccountInfo,
      validatorInfo,
      validatorScore,
      validatorApy,
    });

    if (i % BATCH_SIZE === 0) {
      await sleep(1);
      console.log(`batch index: ${i}`);
      onValidatorMetas([...validatorMetas]);
    }

    if (abortSignal.aborted) {
      return;
    }
  }

  for (let i = 0; i < remainingVoteAccountInfos.length; i++) {
    const voteAccountInfo = remainingVoteAccountInfos[i];

    const validatorInfoIndex = remainingValidatorInfos.findIndex(
      (validatorInfo) =>
        validatorInfo.key.equals(toPublicKey(voteAccountInfo.nodePubkey))
    );
    let validatorInfo: ValidatorInfo | undefined;
    [validatorInfo] =
      validatorInfoIndex > -1
        ? remainingValidatorInfos.splice(validatorInfoIndex, 1)
        : [];

    const validatorApyIndex = remainingValidatorApys.findIndex(
      (validatorApy) => validatorApy.id === voteAccountInfo.nodePubkey
    );
    let validatorApy: ValidatorApy | undefined;
    [validatorApy] =
      validatorApyIndex > -1
        ? remainingValidatorApys.splice(validatorApyIndex, 1)
        : [];

    validatorMetas.push({
      voteAccountInfo,
      validatorInfo,
      validatorScore: undefined,
      validatorApy,
    });

    if (i % BATCH_SIZE === 0) {
      await sleep(1);
      console.log(`batch index: ${i}`);
      onValidatorMetas([...validatorMetas]);
    }

    if (abortSignal.aborted) {
      return;
    }
  }
  return validatorMetas;
}
