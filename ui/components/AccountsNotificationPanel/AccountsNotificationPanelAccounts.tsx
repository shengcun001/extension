import React, { ReactElement, useEffect, useState } from "react"
import { setNewSelectedAccount } from "@tallyho/tally-background/redux-slices/ui"
import { deriveAddress } from "@tallyho/tally-background/redux-slices/keyrings"
import {
  AccountTotal,
  selectAccountTotalsByCategory,
  selectCurrentAccount,
} from "@tallyho/tally-background/redux-slices/selectors"
import { useHistory } from "react-router-dom"
import { ETHEREUM } from "@tallyho/tally-background/constants/networks"
import { AccountType } from "@tallyho/tally-background/redux-slices/accounts"
import { HIDE_IMPORT_LEDGER } from "@tallyho/tally-background/features/features"
import SharedPanelAccountItem from "../Shared/SharedPanelAccountItem"
import SharedButton from "../Shared/SharedButton"
import {
  useBackgroundDispatch,
  useBackgroundSelector,
  useAreKeyringsUnlocked,
} from "../../hooks"

type WalletTypeInfo = {
  title: string
  icon: string
}

const walletTypeDetails: { [key in AccountType]: WalletTypeInfo } = {
  [AccountType.ReadOnly]: {
    title: "Read-only",
    icon: "./images/eye_account@2x.png",
  },
  [AccountType.Imported]: {
    title: "Import",
    icon: "./images/imported@2x.png",
  },
  [AccountType.NewSeed]: {
    title: "Tally",
    icon: "./images/tally_reward@2x.png", // FIXME: Icon is cut off - we should get a better one
  },
  [AccountType.Ledger]: {
    title: "Full access via Ledger", // FIXME: check copy against UI specs
    icon: "./images/ledger_icon@2x.png", // FIXME: use proper icon
  },
}

function WalletTypeHeader({
  accountType,
  onClickAddAddress,
  walletNumber,
}: {
  accountType: AccountType
  onClickAddAddress?: () => void
  walletNumber?: number
}) {
  const { title, icon } = walletTypeDetails[accountType]
  const history = useHistory()
  const areKeyringsUnlocked = useAreKeyringsUnlocked(false)

  return (
    <>
      <header className="wallet_title">
        <h2 className="left">
          <div className="icon" />
          {title} {accountType !== AccountType.ReadOnly ? walletNumber : null}
        </h2>
        {onClickAddAddress ? (
          <div className="right">
            <SharedButton
              type="tertiaryGray"
              size="small"
              icon="plus"
              iconSize="medium"
              onClick={() => {
                if (areKeyringsUnlocked) {
                  onClickAddAddress()
                } else {
                  history.push("/keyring/unlock")
                }
              }}
            >
              Add address
            </SharedButton>
          </div>
        ) : (
          <></>
        )}
      </header>
      <style jsx>{`
        .wallet_title {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .wallet_title > h2 {
          color: #fff;
          font-size: 18px;
          font-weight: 600;
          line-height: 24px;
          padding: 0px 12px 0px 16px;
          margin: 8px 0px;
        }
        .icon {
          background: url("${icon}");
          background-size: cover;
          background-color: #faf9f4;
          width: 24px;
          height: 24px;
          border-radius: 4px;
          margin: 0 7px 0 0;
        }
        .icon_wallet {
          background: url("./images/wallet_kind_icon@2x.png") center no-repeat;
          background-size: cover;
          width: 24px;
          height: 24px;
          margin-right: 8px;
        }
        .icon_edit {
          background: url("./images/edit@2x.png") center no-repeat;
          background-size: cover;
          width: 13px;
          height: 13px;
          margin-left: 8px;
        }
        .left {
          align-items: center;
          display: flex;
        }
        .right {
          align-items: center;
          margin-right: 4px;
        }
      `}</style>
    </>
  )
}

type Props = {
  onCurrentAddressChange: (newAddress: string) => void
}

export default function AccountsNotificationPanelAccounts({
  onCurrentAddressChange,
}: Props): ReactElement {
  const dispatch = useBackgroundDispatch()

  const accountTotals = useBackgroundSelector(selectAccountTotalsByCategory)

  const [pendingSelectedAddress, setPendingSelectedAddress] = useState("")

  const selectedAccountAddress =
    useBackgroundSelector(selectCurrentAccount).address

  const updateCurrentAccount = (address: string) => {
    setPendingSelectedAddress(address)
    dispatch(
      setNewSelectedAccount({
        address,
        network: ETHEREUM,
      })
    )
  }

  useEffect(() => {
    if (
      pendingSelectedAddress !== "" &&
      pendingSelectedAddress === selectedAccountAddress
    ) {
      onCurrentAddressChange(pendingSelectedAddress)
      setPendingSelectedAddress("")
    }
  }, [onCurrentAddressChange, pendingSelectedAddress, selectedAccountAddress])

  const accountTypes = [
    AccountType.NewSeed,
    AccountType.Imported,
    AccountType.ReadOnly,
  ]

  if (!HIDE_IMPORT_LEDGER) {
    accountTypes.push(AccountType.Ledger)
  }

  return (
    <div className="switcher_wrap">
      {accountTypes
        .filter((type) => (accountTotals[type]?.length ?? 0) > 0)
        .map((accountType) => {
          // Known-non-null due to above filter.
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const accountTotalsByType = accountTotals[accountType]!.reduce(
            (acc, accountTypeTotal) => {
              if (accountTypeTotal.keyringId) {
                acc[accountTypeTotal.keyringId] ??= []
                // Known-non-null due to above ??=
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                acc[accountTypeTotal.keyringId].push(accountTypeTotal)
              } else {
                acc.readOnly ??= []
                acc.readOnly.push(accountTypeTotal)
              }
              return acc
            },
            {} as { [keyringId: string]: AccountTotal[] }
          )

          return Object.values(accountTotalsByType).map(
            (accountTotalsByKeyringId, idx) => {
              return (
                <section key={accountType}>
                  <WalletTypeHeader
                    accountType={accountType}
                    walletNumber={idx + 1}
                    onClickAddAddress={
                      accountType === "imported" || accountType === "newSeed"
                        ? () => {
                            if (accountTotalsByKeyringId[0].keyringId) {
                              dispatch(
                                deriveAddress(
                                  accountTotalsByKeyringId[0].keyringId
                                )
                              )
                            }
                          }
                        : undefined
                    }
                  />
                  <ul>
                    {accountTotalsByKeyringId.map((accountTotal) => {
                      const lowerCaseAddress =
                        accountTotal.address.toLocaleLowerCase()
                      const isSelected =
                        lowerCaseAddress === selectedAccountAddress
                      return (
                        <li key={lowerCaseAddress}>
                          <button
                            type="button"
                            onClick={() => {
                              updateCurrentAccount(lowerCaseAddress)
                            }}
                          >
                            <li className="standard_width">
                              <SharedPanelAccountItem
                                key={lowerCaseAddress}
                                accountTotal={accountTotal}
                                isSelected={isSelected}
                                hideMenu={isSelected}
                              />
                            </li>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </section>
              )
            }
          )
        })}
      <footer>
        <SharedButton
          type="tertiary"
          size="medium"
          icon="plus"
          iconSize="medium"
          iconPosition="left"
          linkTo="/onboarding/addWallet"
        >
          Add Wallet
        </SharedButton>
      </footer>
      <style jsx>
        {`
          ul {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            align-content: center;
            margin-bottom: 8px;
          }
          li {
            width: 100%;
            box-sizing: border-box;
            padding: 8px 0px 8px 24px;
          }
          li:hover {
            background-color: var(--hunter-green);
          }
          footer {
            width: 100%;
            height: 48px;
            background-color: var(--hunter-green);
            position: fixed;
            bottom: 0px;
            display: flex;
            justify-content: flex-end;
            align-items: center;
            padding: 0px 12px;
            box-sizing: border-box;
          }
          .switcher_wrap {
            height: 432px;
            overflow-y: scroll;
          }
          section:first-of-type {
            padding-top: 16px;
          }
        `}
      </style>
    </div>
  )
}
