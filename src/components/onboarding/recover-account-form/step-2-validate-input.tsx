import { Button } from "@/components/generic/button";
import { ButtonWrapper } from "@/components/generic/button-wrapper";
import { OnboardingHeading } from "../onboarding-header";
import { ValidateRecoveryInput } from "./ValidateRecoveryInput";
import type { Props } from "./index";


export default function Step_2_validateRecoveryUserInput(props: Props & { onBack: () => void }) {

  let heading = 'Recover or Import Standard Wallet';
  if (props.walletType === 'hidden') {
    heading = 'Recover or Import Hidden Wallet';
  }
  return <>
    <OnboardingHeading heading={heading} progress={50} />
    <ValidateRecoveryInput walletType={props.walletType}></ValidateRecoveryInput>
    <ButtonWrapper>
      <Button variant="transparent" onClick={props.onBack}>
        Back
      </Button>
      <Button type="submit" variant="primary">
        Proceed
      </Button>
    </ButtonWrapper>
  </>
}
